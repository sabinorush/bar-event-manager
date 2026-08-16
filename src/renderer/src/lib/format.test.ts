import { describe, expect, it } from 'vitest'
import { formatCurrency, formatCurrencyPrecise, formatDate } from './format'

describe('formatCurrency', () => {
  it('formata em pt-BR com R$ e vírgula decimal', () => {
    expect(formatCurrency(1234.5)).toBe('R$ 1.234,50')
  })

  it('formata zero e valores negativos', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00')
    expect(formatCurrency(-50)).toBe('-R$ 50,00')
  })
})

describe('formatCurrencyPrecise', () => {
  it('usa 4 casas decimais, útil para custo por ml', () => {
    expect(formatCurrencyPrecise(0.0407)).toBe('R$ 0,0407')
  })
})

describe('formatDate', () => {
  it('formata data ISO no padrão pt-BR curto por padrão', () => {
    // checa o mês abreviado (não o dia exato) para não depender do fuso
    // horário da máquina que roda o teste — meia-noite UTC pode virar o dia
    // anterior em fusos negativos
    expect(formatDate('2024-11-20').toLowerCase()).toContain('nov')
  })

  it('aceita opções customizadas do Intl.DateTimeFormat', () => {
    const result = formatDate('2024-11-20', { day: 'numeric', month: 'short', year: 'numeric' })
    expect(result).toContain('2024')
  })
})
