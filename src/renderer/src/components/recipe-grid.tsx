import { useState } from 'react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAppStore } from '../store/useAppStore'
import { recipeCost } from '@shared/domain/cost'
import type { Recipe } from '@shared/types'
import { formatCurrency } from '../lib/format'
import { recipeCategoryColors, recipeCategoryTranslations } from '../lib/recipe-categories'
import { Plus, Search, Wine, Edit, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { RecipeFormDialog } from './recipe-form-dialog'

const categoryColors = recipeCategoryColors
const categoryTranslations = recipeCategoryTranslations

export function RecipeGrid() {
  const recipes = useAppStore((s) => s.recipes)
  const ingredients = useAppStore((s) => s.ingredients)
  const deleteRecipe = useAppStore((s) => s.deleteRecipe)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>(undefined)

  const openCreateDialog = () => {
    setEditingRecipe(undefined)
    setDialogOpen(true)
  }

  const openEditDialog = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setDialogOpen(true)
  }

  const handleDelete = async (recipe: Recipe) => {
    try {
      await deleteRecipe(recipe.id)
      toast.success('Receita removida.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível remover a receita.')
    }
  }

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const costs = recipes.map((recipe) => recipeCost(recipe, ingredients))
  const averageCost = recipes.length > 0 ? costs.reduce((sum, c) => sum + c, 0) / recipes.length : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gerenciador de Receitas</h1>
          <p className="text-muted-foreground mt-1">Crie e gerencie suas receitas de cocktails</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nova Receita
        </Button>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar receitas por nome ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRecipes.map((recipe, index) => {
          const costPrice = recipeCost(recipe, ingredients)
          const isPremium = costPrice > 5

          return (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
            >
              <Card className="p-5 bg-card border-border hover:border-primary/50 transition-all duration-300 h-full flex flex-col cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="mb-2 group-hover:text-primary transition-colors">{recipe.name}</h4>
                    <Badge className={categoryColors[recipe.category]}>{categoryTranslations[recipe.category] ?? recipe.category}</Badge>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Wine className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">Copo: {recipe.glassType}</p>

                <div className="flex-1 mb-4">
                  <p className="text-sm mb-2 text-muted-foreground">Ingredientes:</p>
                  <ul className="space-y-1">
                    {recipe.ingredients.map((ing, idx) => {
                      const ingredient = ingredients.find((i) => i.id === ing.ingredientId)
                      return (
                        <li key={idx} className="text-sm flex justify-between items-center">
                          <span className="text-foreground/90">{ingredient?.name}</span>
                          <span className="text-muted-foreground text-xs">{ing.amount}ml</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Custo</span>
                  <Badge
                    className={
                      isPremium
                        ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50'
                        : 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50'
                    }
                  >
                    {formatCurrency(costPrice)}
                  </Badge>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(recipe)}
                    className="hover:bg-primary/20 hover:text-primary transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(recipe)}
                    className="hover:bg-destructive/20 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filteredRecipes.length === 0 && (
        <Card className="p-12 bg-card border-border">
          <div className="text-center text-muted-foreground">
            <p>Nenhuma receita encontrada correspondente à sua busca.</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <p className="text-muted-foreground text-sm">Total de Receitas</p>
          <p className="text-2xl mt-1 text-primary">{recipes.length}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-muted-foreground text-sm">Clássicos</p>
          <p className="text-2xl mt-1">{recipes.filter((r) => r.category === 'Classic').length}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-muted-foreground text-sm">Premium</p>
          <p className="text-2xl mt-1 text-gold">{recipes.filter((r) => r.category === 'Premium').length}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-muted-foreground text-sm">Custo Médio</p>
          <p className="text-2xl mt-1 text-emerald">{formatCurrency(averageCost)}</p>
        </Card>
      </div>

      <RecipeFormDialog open={dialogOpen} onOpenChange={setDialogOpen} recipe={editingRecipe} />
    </div>
  )
}
