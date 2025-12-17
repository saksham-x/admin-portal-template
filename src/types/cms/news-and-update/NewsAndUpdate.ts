import { Imagepath } from "@/types/FilePath"

export interface NewsAndUpdate {
  title: string
  url: string
  published_by?: string | null
  publish_date?: string | null  
  social_share_image?: Imagepath | null
  is_active: boolean
}

export interface NewsAndUpdateView extends NewsAndUpdate {
  id: number
  slug?: string | null
  social_share_image?: Imagepath | null
}