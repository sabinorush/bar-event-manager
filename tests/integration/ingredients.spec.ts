import { test, expect } from '../fixtures'

test.describe('ingredientes (IPC)', () => {
  test('cria, lista e apaga um ingrediente', async ({ appWindow }) => {
    const result = await appWindow.evaluate(async () => {
      const created = await window.api.ingredients.create({
        name: 'Ingrediente de Teste',
        category: 'Mixers',
        supplier: 'Fornecedor Teste',
        costPerBottle: 10,
        bottleSize: 500
      })

      const afterCreate = await window.api.ingredients.list()
      await window.api.ingredients.delete(created.id)
      const afterDelete = await window.api.ingredients.list()

      return {
        createdId: created.id,
        foundAfterCreate: afterCreate.some((i) => i.id === created.id),
        foundAfterDelete: afterDelete.some((i) => i.id === created.id)
      }
    })

    expect(result.createdId).toBeTruthy()
    expect(result.foundAfterCreate).toBe(true)
    expect(result.foundAfterDelete).toBe(false)
  })

  test('bloqueia apagar um ingrediente usado numa receita, citando o nome da receita', async ({ appWindow }) => {
    // regressão do bug corrigido: antes disso, a Promise rejeitava sem
    // mensagem e a UI travava em "Carregando..." sem nenhum aviso
    const error = await appWindow.evaluate(async () => {
      try {
        await window.api.ingredients.delete('gin-1') // usado na receita 'Negroni' do seed
        return null
      } catch (e) {
        return e instanceof Error ? e.message : String(e)
      }
    })

    expect(error).toBeTruthy()
    expect(error).toContain('Negroni')

    // confirma que nada foi corrompido: o ingrediente continua lá
    const stillExists = await appWindow.evaluate(async () => {
      const list = await window.api.ingredients.list()
      return list.some((i) => i.id === 'gin-1')
    })
    expect(stillExists).toBe(true)
  })
})
