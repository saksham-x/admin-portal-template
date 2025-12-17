export interface Faq {
  id: number
  title: string
  short_description: string | null
  description: string | null
  tags: string | null
  position: number
  is_active: number | boolean
}

export interface FaqView extends Faq {
  id: number
}
