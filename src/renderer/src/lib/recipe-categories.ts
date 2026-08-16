import type { RecipeCategory } from '@shared/types'

export const recipeCategoryColors: Record<RecipeCategory, string> = {
  Classic: 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/50',
  Signature: 'bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/50',
  Premium: 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50',
  Mocktail: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50'
}

export const recipeCategoryTranslations: Record<RecipeCategory, string> = {
  Classic: 'Clássico',
  Signature: 'Assinatura',
  Premium: 'Premium',
  Mocktail: 'Mocktail'
}

export const recipeCategoryOptions = Object.keys(recipeCategoryTranslations) as RecipeCategory[]
