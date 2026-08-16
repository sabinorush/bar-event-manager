/**
 * Rede de segurança: se uma checagem proativa de uso (ver ingredients.ts/recipes.ts)
 * deixar passar algum caso não previsto, o SQLite ainda bloqueia via
 * `ON DELETE RESTRICT` — isso traduz o erro cru do driver numa mensagem legível
 * em vez de deixar a stack trace do SQLite vazar pro usuário.
 */
export function rethrowFriendly(error: unknown): never {
  if (error instanceof Error && error.message.includes('FOREIGN KEY constraint failed')) {
    throw new Error('Não é possível remover: este item está em uso em outro registro.')
  }
  throw error
}
