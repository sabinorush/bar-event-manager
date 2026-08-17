import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { toast } from 'sonner'
import { useAppStore } from '../store/useAppStore'
import type { Ingredient, IngredientCategory } from '@shared/types'

const categoryTranslations: Record<IngredientCategory, string> = {
  Spirits: 'Destilados',
  Liqueurs: 'Licores',
  Mixers: 'Mixers',
  Syrups: 'Xaropes',
  Fruits: 'Frutas',
  Garnish: 'Guarnições'
}

const categoryOptions = Object.keys(categoryTranslations) as IngredientCategory[]

interface IngredientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ingredient?: Ingredient
}

const emptyForm = {
  name: '',
  category: 'Spirits' as IngredientCategory,
  supplier: '',
  costPerBottle: '',
  bottleSize: ''
}

export function IngredientFormDialog({ open, onOpenChange, ingredient }: IngredientFormDialogProps) {
  const createIngredient = useAppStore((s) => s.createIngredient)
  const updateIngredient = useAppStore((s) => s.updateIngredient)

  const isEditing = Boolean(ingredient)

  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (ingredient) {
      setForm({
        name: ingredient.name,
        category: ingredient.category,
        supplier: ingredient.supplier,
        costPerBottle: String(ingredient.costPerBottle),
        bottleSize: String(ingredient.bottleSize)
      })
    } else {
      setForm(emptyForm)
    }
  }, [open, ingredient])

  const canSubmit =
    form.name.trim().length > 0 &&
    form.supplier.trim().length > 0 &&
    Number(form.costPerBottle) > 0 &&
    Number(form.bottleSize) > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        supplier: form.supplier.trim(),
        costPerBottle: Number(form.costPerBottle),
        bottleSize: Number(form.bottleSize)
      }

      if (ingredient) {
        await updateIngredient({ ...payload, id: ingredient.id })
        toast.success('Ingrediente atualizado.')
      } else {
        await createIngredient(payload)
        toast.success('Ingrediente adicionado.')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o ingrediente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Ingrediente' : 'Adicionar Ingrediente'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize os dados do ingrediente.' : 'Cadastre um novo ingrediente no inventário do bar.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="ing-name" className="mb-2">
              Nome
            </Label>
            <Input
              id="ing-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="bg-background border-border"
              placeholder="Ex.: Tanqueray London Dry Gin"
            />
          </div>

          <div>
            <Label className="mb-2">Categoria</Label>
            <Select value={form.category} onValueChange={(value) => setForm((f) => ({ ...f, category: value as IngredientCategory }))}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {categoryTranslations[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ing-supplier" className="mb-2">
              Fornecedor
            </Label>
            <Input
              id="ing-supplier"
              value={form.supplier}
              onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
              className="bg-background border-border"
              placeholder="Ex.: Premium Spirits Co."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ing-cost" className="mb-2">
                Custo/Garrafa (R$)
              </Label>
              <Input
                id="ing-cost"
                type="number"
                min="0"
                step="0.01"
                value={form.costPerBottle}
                onChange={(e) => setForm((f) => ({ ...f, costPerBottle: e.target.value }))}
                className="bg-background border-border"
              />
            </div>
            <div>
              <Label htmlFor="ing-size" className="mb-2">
                Tamanho (ml)
              </Label>
              <Input
                id="ing-size"
                type="number"
                min="0"
                step="1"
                value={form.bottleSize}
                onChange={(e) => setForm((f) => ({ ...f, bottleSize: e.target.value }))}
                className="bg-background border-border"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border hover:bg-secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSaving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
