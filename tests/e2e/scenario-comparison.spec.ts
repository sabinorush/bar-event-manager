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
})
