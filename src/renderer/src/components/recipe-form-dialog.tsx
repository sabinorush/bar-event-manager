import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '../store/useAppStore'
import { recipeCategoryOptions, recipeCategoryTranslations } from '../lib/recipe-categories'
import type { Recipe, RecipeCategory } from '@shared/types'

interface IngredientRow {
  key: string
  ingredientId: string
  amount: string
}

interface RecipeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipe?: Recipe
}

function emptyRow(): IngredientRow {
  return { key: crypto.randomUUID(), ingredientId: '', amount: '' }
}

export function RecipeFormDialog({ open, onOpenChange, recipe }: RecipeFormDialogProps) {
  const ingredients = useAppStore((s) => s.ingredients)
  const createRecipe = useAppStore((s) => s.createRecipe)
  const updateRecipe = useAppStore((s) => s.updateRecipe)

  const isEditing = Boolean(recipe)

  const [name, setName] = useState('')
  const [category, setCategory] = useState<RecipeCategory>('Classic')
  const [glassType, setGlassType] = useState('')
  const [rows, setRows] = useState<IngredientRow[]>([emptyRow()])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (recipe) {
      setName(recipe.name)
      setCategory(recipe.category)
      setGlassType(recipe.glassType)
      setRows(
        recipe.ingredients.length > 0
          ? recipe.ingredients.map((ing) => ({ key: crypto.randomUUID(), ingredientId: ing.ingredientId, amount: String(ing.amount) }))
          : [emptyRow()]
      )
    } else {
      setName('')
      setCategory('Classic')
      setGlassType('')
      setRows([emptyRow()])
    }
  }, [open, recipe])

  const sortedIngredients = [...ingredients].sort((a, b) => a.name.localeCompare(b.name))

  const updateRow = (key: string, patch: Partial<IngredientRow>) => {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  const addRow = () => setRows((prev) => [...prev, emptyRow()])
  const removeRow = (key: string) => setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.key !== key) : prev))

  const validRows = rows.filter((row) => row.ingredientId && Number(row.amount) > 0)
  const canSubmit = name.trim().length > 0 && glassType.trim().length > 0 && validRows.length === rows.length && rows.length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSaving(true)
    try {
      const payload = {
        name: name.trim(),
        category,
        glassType: glassType.trim(),
        ingredients: rows.map((row) => ({ ingredientId: row.ingredientId, amount: Number(row.amount) }))
      }

      if (recipe) {
        await updateRecipe({ ...payload, id: recipe.id })
        toast.success('Receita atualizada.')
      } else {
        await createRecipe(payload)
        toast.success('Receita criada.')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar a receita.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Receita' : 'Nova Receita'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize os dados da receita.' : 'Cadastre uma nova receita de coquetel.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipe-name" className="mb-2">
                Nome
              </Label>
              <Input
                id="recipe-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background border-border"
                placeholder="Ex.: Negroni"
              />
            </div>

            <div>
              <Label className="mb-2">Categoria</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as RecipeCategory)}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recipeCategoryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {recipeCategoryTranslations[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="recipe-glass" className="mb-2">
              Tipo de Copo
            </Label>
            <Input
              id="recipe-glass"
              value={glassType}
              onChange={(e) => setGlassType(e.target.value)}
              className="bg-background border-border"
              placeholder="Ex.: Copo Rocks"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Ingredientes</Label>
              <Button variant="outline" size="sm" onClick={addRow} className="border-border hover:bg-secondary">
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {rows.map((row) => (
                <div key={row.key} className="flex items-center gap-2">
                  <Select value={row.ingredientId} onValueChange={(value) => updateRow(row.key, { ingredientId: value })}>
                    <SelectTrigger data-testid="ingredient-select" className="bg-background border-border flex-1">
                      <SelectValue placeholder="Selecione um ingrediente" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedIngredients.map((ingredient) => (
                        <SelectItem key={ingredient.id} value={ingredient.id}>
                          {ingredient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={row.amount}
                    onChange={(e) => updateRow(row.key, { amount: e.target.value })}
                    className="bg-background border-border w-24"
                    placeholder="ml"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(row.key)}
                    disabled={rows.length === 1}
                    className="hover:bg-destructive/20 hover:text-destructive transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border hover:bg-secondary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSaving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Receita'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
