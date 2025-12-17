import { Imagepath } from "@/types/FilePath"


export interface Blog {
  id: number;
  title: string;
  slug: string;
  type: string;
  publish_date: string | null;
  formatted_publish_date?: string | null;
  author_name?: string | null;
  author_image_path?: string[] | null;
  image_path?:Imagepath | null;
  content: string | null;
  seo_title: string | null;
  seo_keyword: string[] | string | null;
  seo_description: string | null;
  social_share_image: string | null;
  social_share_description: string | null;
  category_id: number | null;

  // categories?: BlogCategoryList[];
  is_active: boolean | number;
}

export interface BlogView extends Blog {
  id: number;
}