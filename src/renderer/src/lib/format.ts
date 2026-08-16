const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
})

const currencyFormatterPrecise = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 4,
  maximumFractionDigits: 4
})

/** Formata um valor em Reais, ex.: 1234.5 -> "R$ 1.234,50" */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

/** Formata custo por ml com mais casas decimais, ex.: "R$ 0,0407" */
export function formatCurrencyPrecise(value: number): string {
  return currencyFormatterPrecise.format(value)
}

export function formatDate(iso: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString('pt-BR', options ?? { month: 'short', day: 'numeric' })
}
