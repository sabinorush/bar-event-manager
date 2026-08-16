import { test, expect } from '../fixtures'

test.describe('inicialização do app', () => {
  test('abre direto no Dashboard, sem ficar preso em "Carregando..." nem cair na tela de erro', async ({ appWindow }) => {
    // Regressão do bug real encontrado nesta sessão: o preload falhava ao
    // carregar (path/formato errados) e window.api ficava undefined — a UI
    // ficava presa na tela de loading para sempre, sem nenhum erro visível.
    await expect(appWindow.getByText('Não foi possível carregar os dados do bar.')).not.toBeVisible()
    await expect(appWindow.getByRole('heading', { name: 'Dashboard Executivo' })).toBeVisible()
  })

  test('KPIs do Dashboard mostram os dados reais do seed em R$', async ({ appWindow }) => {
    await expect(appWindow.getByText('Receita Total')).toBeVisible()
    await expect(appWindow.getByText(/^R\$/).first()).toBeVisible()
    await expect(appWindow.getByText('Eventos Recentes')).toBeVisible()
  })
})
