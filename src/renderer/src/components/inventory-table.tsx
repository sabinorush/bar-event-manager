import { useState } from 'react'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Search, Edit, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatCurrencyPrecise } from '../lib/format'
import { costPerMl } from '@shared/domain/cost'
import type { Ingredient, IngredientCategory } from '@shared/types'
import { motion } from 'motion/react'
import { useAppStore } from '../store/useAppStore'
import { IngredientFormDialog } from './ingredient-form-dialog'

const categoryColors: Record<IngredientCategory, string> = {
  Spirits: 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50',
  Liqueurs: 'bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/50',
  Mixers: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50',
  Syrups: 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/50',
  Fruits: 'bg-[#F43F5E]/20 text-[#F43F5E] border-[#F43F5E]/50',
  Garnish: 'bg-[#94A3B8]/20 text-[#94A3B8] border-[#94A3B8]/50'
}

const categoryTranslations: Record<IngredientCategory, string> = {
  Spirits: 'Destilados',
  Liqueurs: 'Licores',
  Mixers: 'Mixers',
  Syrups: 'Xaropes',
  Fruits: 'Frutas',
  Garnish: 'Guarnições'
}

export function InventoryTable() {
  const inventoryItems = useAppStore((s) => s.ingredients)
  const deleteIngredient = useAppStore((s) => s.deleteIngredient)

  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined)

  const openCreateDialog = () => {
    setEditingIngredient(undefined)
    setDialogOpen(true)
  }

  const openEditDialog = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient)
    setDialogOpen(true)
  }

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    try {
      await deleteIngredient(id)
      toast.success('Ingrediente removido.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível remover o ingrediente.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestão de Inventário</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus ingredientes e suprimentos do bar</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Ingrediente
        </Button>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nome, fornecedor ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
      </Card>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="bg-card border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="text-right">Custo/Garrafa</TableHead>
                <TableHead className="text-right">Tamanho</TableHead>
                <TableHead className="text-right">Custo/ml</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="border-border hover:bg-secondary/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={categoryColors[item.category]}>{categoryTranslations[item.category] ?? item.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.supplier}</TableCell>
                  <TableCell className="text-right text-gold">{formatCurrency(item.costPerBottle)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.bottleSize}ml</TableCell>
                  <TableCell className="text-right">{formatCurrencyPrecise(costPerMl(item))}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(item)}
                        className="hover:bg-primary/20 hover:text-primary transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="hover:bg-destructive/20 hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum item encontrado correspondente à sua busca.</p>
            </div>
          )}
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-card border-border">
          <p className="text-muted-foreground text-sm">Total de Itens</p>
          <p className="text-2xl mt-1 text-primary">{inventoryItems.length}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-muted-foreground text-sm">Valor Total</p>
          <p className="text-2xl mt-1 text-emerald">
            {formatCurrency(inventoryItems.reduce((sum, item) => sum + item.costPerBottle, 0))}
          </p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-muted-foreground text-sm">Categorias</p>
          <p className="text-2xl mt-1">{new Set(inventoryItems.map((item) => item.category)).size}</p>
        </Card>
      </div>

      <IngredientFormDialog open={dialogOpen} onOpenChange={setDialogOpen} ingredient={editingIngredient} />
    </div>
  )
}
