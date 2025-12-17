import { Imagepath } from "@/types/FilePath"

export interface BlogCategory {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  featured_image: string | null;
  parent_title: string | null;
  is_active: number | boolean;
  image_path: Imagepath| null;
}

export interface BlogCategoryView extends BlogCategory {
  id: number;
}

// export interface BlogCategoryCreatePayload {
//   title: string;
//   description?: string | null;
//   featured_image?: File | null;
//   is_active: boolean;
// }

// export type BlogCategoryUpdatePayload = Partial<BlogCategoryCreatePayload>
