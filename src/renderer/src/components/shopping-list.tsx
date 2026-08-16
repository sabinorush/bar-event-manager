import { useEffect, useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Checkbox } from './ui/checkbox'
import { useAppStore } from '../store/useAppStore'
import { groupRequirementsByCategory } from '@shared/domain/shopping-list'
import type { IngredientCategory, ShoppingListItem } from '@shared/types'
import { formatCurrency } from '../lib/format'
import { buildShoppingListCsv } from '../lib/csv'
import { Printer, Download, ShoppingCart, Package, Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'

interface ShoppingListProps {
  eventId: string
}

const categoryOrder: IngredientCategory[] = ['Spirits', 'Liqueurs', 'Mixers', 'Syrups', 'Fruits', 'Garnish']

const categoryTranslations: Record<IngredientCategory, string> = {
  Spirits: 'Destilados',
  Liqueurs: 'Licores',
  Mixers: 'Mixers',
  Syrups: 'Xaropes',
  Fruits: 'Frutas',
  Garnish: 'Guarnições'
}

export function ShoppingList({ eventId }: ShoppingListProps) {
  const event = useAppStore((s) => s.events.find((e) => e.id === eventId))
  const ingredients = useAppStore((s) => s.ingredients)

  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    window.api.shoppingList
      .forEvent(eventId)
      .then((result) => {
        if (!cancelled) setItems(result)
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Não foi possível carregar a lista de compras.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [eventId])

  const groupedItems = groupRequirementsByCategory(items, ingredients)
  const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0)
  const totalBottles = items.reduce((sum, item) => sum + item.bottlesNeeded, 0)
  const purchasedCount = items.filter((item) => item.purchased).length

  const totalDrinks = event ? event.pax * event.drinksPerPax : 0
  const cocktailCount = event ? event.cocktailMix.length : 0

  const handleTogglePurchased = async (ingredientId: string, purchased: boolean) => {
    setItems((prev) => prev.map((item) => (item.ingredientId === ingredientId ? { ...item, purchased } : item)))
    try {
      await window.api.shoppingList.togglePurchased({ eventId, ingredientId, purchased })
    } catch (error) {
      setItems((prev) => prev.map((item) => (item.ingredientId === ingredientId ? { ...item, purchased: !purchased } : item)))
      toast.error(error instanceof Error ? error.message : 'Não foi possível atualizar o item.')
    }
  }

  const handleExport = async () => {
    const csv = buildShoppingListCsv(groupedItems, ingredients, categoryOrder, categoryTranslations)
    try {
      const result = await window.api.files.saveText({
        defaultFileName: `lista-de-compras-${new Date().toISOString().slice(0, 10)}.csv`,
        content: csv,
        filterName: 'CSV (separado por ponto e vírgula)',
        filterExtensions: ['csv']
      })
      if (result.saved) {
        toast.success('Lista de compras exportada.')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível exportar a lista de compras.')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Carregando lista de compras...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Lista de Compras</h2>
          <p className="text-muted-foreground mt-1">
            {event ? event.name : 'Seus requisitos completos de ingredientes'} — {purchasedCount} de {items.length} itens comprados
          </p>
        </div>
        <div className="flex gap-2 no-print">
          <Button variant="outline" onClick={handleExport} className="border-border hover:bg-secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Itens</p>
              <p className="text-2xl">{items.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald/10 rounded-lg">
              <Package className="w-5 h-5 text-emerald" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Garrafas</p>
              <p className="text-2xl text-emerald">{totalBottles}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gold/10 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Custo Total</p>
              <p className="text-2xl text-gold">{formatCurrency(totalCost)}</p>
            </div>
          </div>
        </Card>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="p-6 bg-card border-border">
          <h3 className="mb-6">Ingredientes por Categoria</h3>

          <div className="space-y-8">
            {categoryOrder.map((category, catIndex) => {
              const categoryItems = groupedItems[category]
              if (!categoryItems || categoryItems.length === 0) return null

              const categoryTotal = categoryItems.reduce((sum, item) => sum + item.totalCost, 0)

              return (
                <motion.div key={category} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: catIndex * 0.1 }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h4>{categoryTranslations[category] ?? category}</h4>
                      <Badge variant="outline" className="text-xs">
                        {categoryItems.length} itens
                      </Badge>
                    </div>
                    <span className="text-muted-foreground text-sm">{formatCurrency(categoryTotal)}</span>
                  </div>

                  <div className="space-y-3">
                    {categoryItems.map((item, index) => {
                      const ingredient = ingredients.find((i) => i.id === item.ingredientId)
                      if (!ingredient) return null

                      return (
                        <motion.div
                          key={item.ingredientId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className={`flex items-center justify-between p-4 bg-background rounded-lg hover:bg-secondary/50 transition-colors ${
                            item.purchased ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              checked={item.purchased}
                              onCheckedChange={(checked) => handleTogglePurchased(item.ingredientId, checked === true)}
                              className="no-print"
                            />
                            <div>
                              <p className={item.purchased ? 'line-through' : ''}>{ingredient.name}</p>
                              <p className="text-sm text-muted-foreground mt-1">{ingredient.supplier}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-8 text-sm">
                            <div className="text-right">
                              <p className="text-muted-foreground mb-1">Volume Necessário</p>
                              <p>{item.totalMlNeeded.toFixed(0)}ml</p>
                            </div>

                            <div className="text-right">
                              <p className="text-muted-foreground mb-1">Garrafas</p>
                              <p className="text-primary">
                                {item.bottlesNeeded} × {ingredient.bottleSize}ml
                              </p>
                            </div>

                            <div className="text-right min-w-[100px]">
                              <p className="text-muted-foreground mb-1">Preço Total</p>
                              <p className="text-gold">{formatCurrency(item.totalCost)}</p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {catIndex < categoryOrder.length - 1 && <Separator className="mt-6 bg-border" />}
                </motion.div>
              )
            })}
          </div>

          <div className="mt-8 pt-6 border-t-2 border-primary/30">
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <div>
                <h3>Total Geral</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalBottles} garrafas de {items.length} ingredientes
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl text-gold">{formatCurrency(totalCost)}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <Card className="p-6 bg-card border-border">
        <h4 className="mb-4">Resumo do Evento</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total de Drinks</p>
            <p className="text-xl">{totalDrinks}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Cocktails</p>
            <p className="text-xl">{cocktailCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Ingredientes</p>
            <p className="text-xl">{items.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Garrafas</p>
            <p className="text-xl text-emerald">{totalBottles}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
