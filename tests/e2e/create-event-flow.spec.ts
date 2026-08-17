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

  test('botão Otimizar para Máx. Lucro redistribui o mix priorizando as receitas mais baratas', async ({ appWindow }) => {
    await appWindow.getByRole('button', { name: 'Planejador de Eventos' }).click()
    await appWindow.getByLabel('Nome do Evento').fill('Evento Otimização')
    await appWindow.getByRole('button', { name: 'Continuar para Smart Mix' }).click()
    await expect(appWindow.getByRole('heading', { name: 'Simulador Smart Mix' })).toBeVisible()

    // mix padrão: Negroni 30% / Margarita 40% (a mais cara) / Whiskey Sour 30%
    await expect(appWindow.getByTestId('mix-percentage-margarita')).toHaveText('40%')

    await appWindow.getByRole('button', { name: 'Otimizar para Máx. Lucro' }).click()

    // continua somando 100%, e a Margarita (receita mais cara) perde participação
    await expect(appWindow.getByText('100%')).toBeVisible()
    const margaritaShare = await appWindow.getByTestId('mix-percentage-margarita').textContent()
    expect(margaritaShare).not.toBe('40%')
    expect(Number(margaritaShare?.replace('%', ''))).toBeLessThan(40)
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
