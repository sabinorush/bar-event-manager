import { test, expect } from '../fixtures'

test.describe('fluxo do Planejador de Eventos', () => {
  test('criar evento → Smart Mix → Lista de Compras, com persistência real', async ({ appWindow }) => {
    await appWindow.getByRole('button', { name: 'Planejador de Eventos' }).click()
    await expect(appWindow.getByRole('heading', { name: 'Escopo do Evento' })).toBeVisible()

    await appWindow.getByLabel('Nome do Evento').fill('Aniversário de Teste')

    await appWindow.getByRole('button', { name: 'Continuar para Smart Mix' }).click()
    await expect(appWindow.getByRole('heading', { name: 'Simulador Smart Mix' })).toBeVisible()

    // o mix padrão (negroni 30 + margarita 40 + whiskey-sour 30) já soma 100%
    await expect(appWindow.getByText('100%')).toBeVisible()

    await appWindow.getByRole('button', { name: 'Finalizar Plano do Evento' }).click()

    await expect(appWindow.getByRole('heading', { name: 'Lista de Compras' })).toBeVisible()
    await expect(appWindow.getByText('Aniversário de Teste')).toBeVisible()
    await expect(appWindow.getByText(/0 de \d+ itens comprados/)).toBeVisible()

    // o evento deve aparecer no Dashboard depois de criado
    await appWindow.getByRole('button', { name: 'Dashboard' }).click()
    await expect(appWindow.getByText('Aniversário de Teste')).toBeVisible()
  })

  test('marcar um item como comprado na Lista de Compras atualiza o contador', async ({ appWindow }) => {
    await appWindow.getByRole('button', { name: 'Planejador de Eventos' }).click()
    await appWindow.getByLabel('Nome do Evento').fill('Evento Checkbox')
    await appWindow.getByRole('button', { name: 'Continuar para Smart Mix' }).click()
    await appWindow.getByRole('button', { name: 'Finalizar Plano do Evento' }).click()

    await expect(appWindow.getByText(/0 de \d+ itens comprados/)).toBeVisible()

    await appWindow.locator('button[role="checkbox"]').first().click()

    await expect(appWindow.getByText(/1 de \d+ itens comprados/)).toBeVisible()
  })
})
