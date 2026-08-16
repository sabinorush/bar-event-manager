import { test, expect } from '../fixtures'

test.describe('receitas (IPC)', () => {
  test('cria, atualiza e apaga uma receita', async ({ appWindow }) => {
    const result = await appWindow.evaluate(async () => {
      const created = await window.api.recipes.create({
        name: 'Receita de Teste',
        category: 'Signature',
        glassType: 'Copo Teste',
        ingredients: [{ ingredientId: 'gin-1', amount: 30 }]
      })

      const updated = await window.api.recipes.update({
        ...created,
        name: 'Receita de Teste Editada',
        ingredients: [{ ingredientId: 'gin-1', amount: 45 }]
      })

      await window.api.recipes.delete(created.id)
      const afterDelete = await window.api.recipes.list()

      return {
        updatedName: updated.name,
        updatedAmount: updated.ingredients[0]?.amount,
        foundAfterDelete: afterDelete.some((r) => r.id === created.id)
      }
    })

    expect(result.updatedName).toBe('Receita de Teste Editada')
    expect(result.updatedAmount).toBe(45)
    expect(result.foundAfterDelete).toBe(false)
  })

  test('bloqueia apagar uma receita usada em algum evento, citando o nome do evento', async ({ appWindow }) => {
    const error = await appWindow.evaluate(async () => {
      try {
        await window.api.recipes.delete('negroni') // usado nos 5 eventos do seed
        return null
      } catch (e) {
        return e instanceof Error ? e.message : String(e)
      }
    })

    expect(error).toBeTruthy()
    expect(error).toMatch(/evento/i)
  })
})
