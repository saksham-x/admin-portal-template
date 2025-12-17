import { Imagepath } from "@/types/FilePath"

export interface Slider {
  title: string
  heading_text: string
  sub_heading_text: string
  description: string
  button_text: string
  show_button: boolean | number
  link: string | null
  image?: File | string | null
  position?: number | null
  new_tab: boolean | number
  is_active: boolean | number
}

export interface SliderView extends Slider {
  id: number

  image_path?:Imagepath | null
}
