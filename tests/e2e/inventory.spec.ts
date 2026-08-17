import { test, expect } from '../fixtures'

test.describe('Inventário', () => {
  test('adiciona um ingrediente pelo diálogo e ele aparece na tabela', async ({ appWindow }) => {
    await appWindow.getByRole('button', { name: 'Inventário' }).click()
    await expect(appWindow.getByRole('heading', { name: 'Gestão de Inventário' })).toBeVisible()

    await appWindow.getByRole('button', { name: 'Adicionar Ingrediente' }).click()
    await expect(appWindow.getByRole('heading', { name: 'Adicionar Ingrediente' })).toBeVisible()

    await appWindow.locator('#ing-name').fill('Xarope de Teste')
    await appWindow.locator('#ing-supplier').fill('Fornecedor Teste')
    await appWindow.locator('#ing-cost').fill('12.5')
    await appWindow.locator('#ing-size').fill('750')

    await appWindow.getByRole('button', { name: 'Adicionar', exact: true }).click()

    await expect(appWindow.getByText('Ingrediente adicionado.')).toBeVisible()
    await expect(appWindow.getByText('Xarope de Teste')).toBeVisible()
  })

  test('edita um ingrediente existente pelo diálogo e a tabela reflete os novos valores', async ({ appWindow }) => {
    await appWindow.getByRole('button', { name: 'Inventário' }).click()
    await appWindow.getByPlaceholder('Buscar por nome, fornecedor ou categoria...').fill('Bacardi Superior')

    const row = appWindow.getByRole('row', { name: /Bacardi Superior/ })
    await row.getByRole('button').first().click() // botão de editar (Edit), o primeiro da linha

    await expect(appWindow.getByRole('heading', { name: 'Editar Ingrediente' })).toBeVisible()
    // o formulário deve vir pré-preenchido com os dados atuais
    await expect(appWindow.locator('#ing-name')).toHaveValue('Bacardi Superior')

    await appWindow.locator('#ing-name').fill('Bacardi Superior Editado')
    await appWindow.locator('#ing-cost').fill('99.9')

    await appWindow.getByRole('button', { name: 'Salvar Alterações' }).click()

    await expect(appWindow.getByText('Ingrediente atualizado.')).toBeVisible()
    await expect(appWindow.getByText('Bacardi Superior Editado')).toBeVisible()
    await expect(appWindow.getByText('R$ 99,90')).toBeVisible()
  })

  test('tentar apagar um ingrediente em uso mostra toast de erro em vez de travar', async ({ appWindow }) => {
    // regressão do bug corrigido nesta sessão
    await appWindow.getByRole('button', { name: 'Inventário' }).click()
    await appWindow.getByPlaceholder('Buscar por nome, fornecedor ou categoria...').fill('Tanqueray')

    const row = appWindow.getByRole('row', { name: /Tanqueray/ })
    await row.getByRole('button').last().click() // botão de excluir (Trash2), o último da linha

    await expect(appWindow.getByText(/Não é possível remover/)).toBeVisible()
    // confirma que o item continua na tabela (nada foi corrompido)
    await expect(appWindow.getByText('Tanqueray London Dry Gin')).toBeVisible()
  })
})
