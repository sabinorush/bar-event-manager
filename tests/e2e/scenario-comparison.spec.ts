import { test, expect } from '../fixtures'

test.describe('Comparação de Cenários', () => {
  test('abre com dois eventos reais pré-selecionados e mostra a diferença calculada', async ({ appWindow }) => {
    await appWindow.getByRole('button', { name: 'Comparar Cenários' }).click()

    await expect(appWindow.getByRole('heading', { name: 'Comparação de Cenários' })).toBeVisible()
    await expect(appWindow.locator('label', { hasText: 'Cenário A' })).toBeVisible()
    await expect(appWindow.locator('label', { hasText: 'Cenário B' })).toBeVisible()
    await expect(appWindow.getByText('Principais Diferenças (B vs A)')).toBeVisible()
    await expect(appWindow.getByText('Mix de Cocktails').first()).toBeVisible()
  })

  test('em janelas menores, o modal fica dentro da viewport com scroll interno em vez de ultrapassar a tela', async ({ appWindow }) => {
    // regressão do bug corrigido nesta sessão: o modal crescia sem limite de
    // altura e ficava metade acima/metade abaixo da tela, inacessível
    await appWindow.setViewportSize({ width: 1366, height: 768 })

    await appWindow.getByRole('button', { name: 'Comparar Cenários' }).click()
    await expect(appWindow.getByRole('heading', { name: 'Comparação de Cenários' })).toBeVisible()

    const dialogBox = await appWindow.locator('[data-slot="dialog-content"]').boundingBox()
    const viewport = appWindow.viewportSize()

    expect(dialogBox).not.toBeNull()
    expect(viewport).not.toBeNull()
    expect(dialogBox!.y).toBeGreaterThanOrEqual(0)
    expect(dialogBox!.y + dialogBox!.height).toBeLessThanOrEqual(viewport!.height)
  })
})
