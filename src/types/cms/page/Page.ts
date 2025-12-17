export interface Page {
  id: number
  title: string
  slug: string
  content: string | null
  position: number | null
  seo_title: string | null
  seo_keyword: string[] | null
  seo_description: string | null
  views: number | null
  is_active: number | boolean
}

export interface PageView extends Page {
  id: number
}
