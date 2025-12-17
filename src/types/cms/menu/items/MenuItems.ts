export interface MenuItem {
  id?: number;
  title?: string;
  page_id?: number | null;
  page?: string;
  blog_id?: number | null;
  blog?: string;
  menu_id?: number;
  menu?: string;
  link?: string | null;
  position?: number | null;
  new_tab?: boolean | number;
  display_on_website?: boolean | number;
  is_active?: boolean | number;
  type?: string | null;
}
export interface MenuItemView extends MenuItem {
  id: number
}

