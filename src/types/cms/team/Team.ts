import {  Imagepath } from "@/types/FilePath"

export interface Team {
  name: string;
  description: string;
  role?: string | null;
  position?: number | null;
  fb_url?: string | null;
  linked_url?: string | null;
  image?: Imagepath | null;
  is_active: boolean;
}

export interface TeamView extends Team {
  id: number;
  slug: string;
  image_path?:Imagepath | null
  created_at?: string;
  updated_at?: string;
}
