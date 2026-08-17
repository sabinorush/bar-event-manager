import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { Checkbox } from './ui/checkbox'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import { useAppStore } from '../store/useAppStore'
import { eventFinancials } from '@shared/domain/margin'
import { recipeCost } from '@shared/domain/cost'
import { optimizeMixForProfit } from '@shared/domain/mix-optimizer'
import type { CocktailMix, EventScope } from '@shared/types'
import { formatCurrency } from '../lib/format'
import { ArrowLeft, TrendingDown, TrendingUp, AlertTriangle, Martini, DollarSign, ShoppingCart, Wand2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface EventPlannerStep2Props {
  scope: EventScope
  onBack: () => void
  onComplete: (mix: CocktailMix[]) => void | Promise<void>
}

export function EventPlannerStep2({ scope, onBack, onComplete }: EventPlannerStep2Props) {
  const recipes = useAppStore((s) => s.recipes)
  const ingredients = useAppStore((s) => s.ingredients)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>(['negroni', 'margarita', 'whiskey-sour'])
  const [cocktailMix, setCocktailMix] = useState<CocktailMix[]>([
    { recipeId: 'negroni', percentage: 30 },
    { recipeId: 'margarita', percentage: 40 },
    { recipeId: 'whiskey-sour', percentage: 30 }
  ])

  const totalDrinks = scope.pax * scope.drinksPerPax

  const financials = eventFinancials(scope, cocktailMix, recipes, ingredients)
  const totalPercentage = cocktailMix.reduce((sum, mix) => sum + mix.percentage, 0)

  const getMarginColor = () => {
    if (financials.margin >= 50) return 'text-emerald'
    if (financials.margin >= 30) return 'text-gold'
    return 'text-rose'
  }

  const getProfitTrend = () => {
    if (financials.margin >= 50) return { icon: TrendingUp, color: 'text-emerald' }
    if (financials.margin >= 30) return { icon: AlertTriangle, color: 'text-gold' }
    return { icon: TrendingDown, color: 'text-rose' }
  }

  const toggleRecipe = (recipeId: string) => {
    if (selectedRecipes.includes(recipeId)) {
      setSelectedRecipes((prev) => prev.filter((id) => id !== recipeId))
      setCocktailMix((prev) => prev.filter((mix) => mix.recipeId !== recipeId))
    } else {
      setSelectedRecipes((prev) => [...prev, recipeId])
      setCocktailMix((prev) => [...prev, { recipeId, percentage: 0 }])
    }
  }

  const updatePercentage = (recipeId: string, percentage: number) => {
    setCocktailMix((prev) => prev.map((mix) => (mix.recipeId === recipeId ? { ...mix, percentage } : mix)))
  }

  const handleOptimizeMix = () => {
    setCocktailMix(optimizeMixForProfit(selectedRecipes, recipes, ingredients))
  }

  const TrendIcon = getProfitTrend().icon

  const handleComplete = async () => {
    setIsSaving(true)
    try {
      await onComplete(cocktailMix)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Simulador Smart Mix</h2>
          <p className="text-muted-foreground mt-1">Otimize seu menu de cocktails para máximo lucro</p>
        </div>
        <Button variant="outline" onClick={onBack} className="border-border hover:bg-secondary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between mb-2">
          <Label>Alocação Total do Mix</Label>
          <span className={`${totalPercentage === 100 ? 'text-emerald' : totalPercentage > 100 ? 'text-rose' : 'text-gold'}`}>
            {totalPercentage}%
          </span>
        </div>
        <Progress value={Math.min(totalPercentage, 100)} className="h-3" />
        {totalPercentage !== 100 && (
          <p className="text-sm text-muted-foreground mt-2">
            {totalPercentage > 100 ? 'Reduza a alocação para 100%' : `${100 - totalPercentage}% restante`}
          </p>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="mb-4 flex items-center gap-2">
              <Martini className="w-5 h-5 text-primary" />
              Selecionar Cocktails
            </h3>

            <div className="space-y-3 mb-6">
              {recipes.slice(0, 6).map((recipe) => (
                <div key={recipe.id} className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={selectedRecipes.includes(recipe.id)} onCheckedChange={() => toggleRecipe(recipe.id)} />
                    <div>
                      <p className="text-sm">{recipe.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(recipeCost(recipe, ingredients))}</p>
                    </div>
                  </div>
                  {recipe.category === 'Premium' && <Badge className="bg-gold/20 text-gold border-gold/50 text-xs">Premium</Badge>}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3>Ajustar Distribuição do Mix</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOptimizeMix}
                disabled={selectedRecipes.length === 0}
                className="border-border hover:bg-secondary"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Otimizar para Máx. Lucro
              </Button>
            </div>

            <div className="space-y-6">
              <AnimatePresence>
                {cocktailMix.map((mix) => {
                  const recipe = recipes.find((r) => r.id === mix.recipeId)
                  if (!recipe) return null

                  const numberOfDrinks = Math.round((mix.percentage / 100) * totalDrinks)

                  return (
                    <motion.div
                      key={mix.recipeId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">{recipe.name}</Label>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{numberOfDrinks} drinks</span>
                          <span
                            data-testid={`mix-percentage-${mix.recipeId}`}
                            className={`text-sm w-12 text-right ${mix.percentage > 0 ? 'text-primary' : 'text-muted-foreground'}`}
                          >
                            {mix.percentage}%
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={[mix.percentage]}
                        onValueChange={(value) => updatePercentage(mix.recipeId, value[0])}
                        max={100}
                        step={5}
                        className="cursor-pointer"
                      />
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="space-y-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald" />
              Impacto Financeiro em Tempo Real
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-background rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Receita Total</span>
                  <span className="text-gold">{formatCurrency(financials.totalRevenue)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {scope.pax} convidados × {formatCurrency(scope.ticketPrice)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Custo de Ingredientes</span>
                  <span className="text-rose">-{formatCurrency(financials.ingredientCost)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Custo Operacional</span>
                  <span className="text-rose">-{formatCurrency(financials.operationalCost)}</span>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between text-sm">
                <span>Custo Total</span>
                <span className="text-rose">{formatCurrency(financials.totalCost)}</span>
              </div>
            </div>
          </Card>

          <motion.div key={financials.netProfit} initial={{ scale: 1 }} animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 0.3 }}>
            <Card
              className={`p-6 bg-gradient-to-br ${
                financials.margin >= 50
                  ? 'from-emerald/20 to-emerald/5 border-emerald/50'
                  : financials.margin >= 30
                    ? 'from-gold/20 to-gold/5 border-gold/50'
                    : 'from-rose/20 to-rose/5 border-rose/50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Lucro Líquido Estimado</p>
                  <h2 className={`text-3xl ${getMarginColor()}`}>{formatCurrency(financials.netProfit)}</h2>
                </div>
                <TrendIcon className={`w-8 h-8 ${getProfitTrend().color}`} />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Margem:</span>
                <span className={`text-xl ${getMarginColor()}`}>{financials.margin.toFixed(1)}%</span>
              </div>

              {financials.margin < 30 && (
                <div className="mt-4 p-3 bg-rose/20 rounded-lg border border-rose/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-rose">
                      Aviso: Margem de lucro baixa. Considere ajustar seu mix para incluir cocktails mais econômicos.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          <Card className="p-6 bg-card border-border">
            <h4 className="mb-4 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Prévia da Lista de Compras
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total de Drinks</span>
                <span>{totalDrinks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receitas Selecionadas</span>
                <span>{cocktailMix.length}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.3 }} className="flex justify-between items-center">
        <Button variant="outline" onClick={handleComplete} disabled={isSaving} className="border-border hover:bg-secondary">
          Ver Lista de Compras
        </Button>
        <Button
          onClick={handleComplete}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          disabled={totalPercentage !== 100 || isSaving}
        >
          {isSaving ? 'Salvando...' : 'Finalizar Plano do Evento'}
        </Button>
      </motion.div>
    </div>
  )
}
