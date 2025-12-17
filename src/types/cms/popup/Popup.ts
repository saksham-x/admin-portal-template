import { Imagepath } from "@/types/FilePath"

export interface Popup {
  title: string
  position?: number | null
  description?: string | null
  link?: string | null
  type?: string | null
  video_url?: string | null
  image?: File | string | null
  start_date?: string | null
  end_date?: string | null
  is_active: boolean
}

export interface PopupView extends Popup {
  id: number
  image_path?: Imagepath
}
