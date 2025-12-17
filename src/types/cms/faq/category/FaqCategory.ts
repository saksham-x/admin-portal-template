export interface FaqCategory {
  name: string
  description: string | null
  position: number
  parent_name: string | null
  is_active: number
}

export interface FaqCategoryView extends FaqCategory {
  id: number
}