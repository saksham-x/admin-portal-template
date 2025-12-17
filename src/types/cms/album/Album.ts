import { Imagepath } from "@/types/FilePath"

export interface Album {
  id: number
  title: string
  cover_image_path: Imagepath
  description: string | null
  tags: string[] | null
  position: number | null
  event_date?: string | null
  is_active: number | boolean
}

export interface AlbumView extends Album {
  id: number
}

