import { Imagepath } from "@/types/FilePath"

export interface Program {
  title: string
  short_title?: string | null
  level_id: number | null
  description?: string | null
  feature_image_file?: File | []
  position?: number | string | null
  entrance_date?: string | null
  enrollment_closing_date?: string | null
  seo_title?: string | null
  seo_keyword?: string | null
  seo_description?: string | null
  admission_open_link?: string | null
  display_in_enrollment?: boolean
  display_in_website?: boolean
  is_active?: boolean
}

export interface ProgramView extends Program {
  id: number
  slug?: string
  feature_image?: string | null
  feature_image_path?: Imagepath | null
  level?: { id: number; title: string } | null
}
export interface ProgramSort  {
  id: number
}

