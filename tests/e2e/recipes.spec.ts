import { test, expect } from '../fixtures'

test.describe('Receitas', () => {
  test('cria uma receita nova com ingredientes dinâmicos e ela aparece no grid', async ({ appWindow }) => {
    await appWindow.getByRole('button', { name: 'Receitas' }).click()
    await appWindow.getByRole('button', { name: 'Nova Receita' }).click()

    await expect(appWindow.getByRole('heading', { name: 'Nova Receita' })).toBeVisible()
    await appWindow.locator('#recipe-name').fill('Drink de Teste')
    await appWindow.locator('#recipe-glass').fill('Copo Teste')

    // primeira linha de ingrediente já vem em branco por padrão
    await appWindow.getByTestId('ingredient-select').first().click()
    await appWindow.getByRole('option', { name: 'Tanqueray London Dry Gin' }).click()
    await appWindow.locator('input[type="number"]').first().fill('40')

    // adiciona uma segunda linha
    await appWindow.getByRole('button', { name: 'Adicionar' }).click()
    await appWindow.getByTestId('ingredient-select').nth(1).click()
    await appWindow.getByRole('option', { name: 'Campari' }).click()
    await appWindow.locator('input[type="number"]').nth(1).fill('20')

    await appWindow.getByRole('button', { name: 'Criar Receita' }).click()

    await expect(appWindow.getByText('Receita criada.')).toBeVisible()
    await expect(appWindow.getByText('Drink de Teste')).toBeVisible()
  })

  test('bloqueia apagar uma receita usada em eventos', async ({ appWindow }) => {
    await appWindow.getByRole('button', { name: 'Receitas' }).click()
    await appWindow.getByPlaceholder('Buscar receitas por nome ou categoria...').fill('Negroni')

    const card = appWindow.locator('[data-slot="card"]', { hasText: 'Negroni' })
    await card.getByRole('button').last().click()

    await expect(appWindow.getByText(/Não é possível remover/)).toBeVisible()
  })
})
