import { Imagepath } from "@/types/FilePath"

export interface OurService {
  id: number;
  title: string;
  icon: File | File[] | null
  icon_image_path?: Imagepath | null
  description?: string | null;
  is_active: boolean;
  position?: number;
}
