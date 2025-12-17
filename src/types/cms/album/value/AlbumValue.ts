import { Imagepath } from "@/types/FilePath"

export interface AlbumValue {
  id: number
  album_id: number | string
  slug: string
  title: string | null
  image_path: Imagepath | null
  is_featured: number | boolean
  position: number
}


export interface AlbumValueView extends AlbumValue { 
  id: number
}

