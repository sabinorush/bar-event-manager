import type { Ingredient, IngredientCategory, ShoppingListItem } from '@shared/types'

/**
 * CSV com delimitador `;` e decimal com vírgula — é o que o Excel em pt-BR
 * espera ao abrir um .csv por duplo clique (com `,` como delimitador ele
 * separa os campos errado, já que `,` também é o separador decimal daqui).
 */
function csvField(value: string | number): string {
  const text = typeof value === 'number' ? value.toFixed(2).replace('.', ',') : value
  if (/[";\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function buildShoppingListCsv(
  groupedItems: Record<string, ShoppingListItem[]>,
  ingredients: Ingredient[],
  categoryOrder: IngredientCategory[],
  categoryTranslations: Record<IngredientCategory, string>
): string {
  const header = ['Categoria', 'Ingrediente', 'Fornecedor', 'Volume Necessário (ml)', 'Garrafas', 'Tamanho da Garrafa (ml)', 'Custo Total (R$)', 'Comprado']
  const rows: string[] = [header.map(csvField).join(';')]

  for (const category of categoryOrder) {
    const items = groupedItems[category]
    if (!items || items.length === 0) continue

    for (const item of items) {
      const ingredient = ingredients.find((i) => i.id === item.ingredientId)
      if (!ingredient) continue

      rows.push(
        [
          csvField(categoryTranslations[category] ?? category),
          csvField(ingredient.name),
          csvField(ingredient.supplier),
          csvField(Math.round(item.totalMlNeeded)),
          csvField(item.bottlesNeeded),
          csvField(ingredient.bottleSize),
          csvField(item.totalCost),
          csvField(item.purchased ? 'Sim' : 'Não')
        ].join(';')
      )
    }
  }

  return rows.join('\r\n')
}
