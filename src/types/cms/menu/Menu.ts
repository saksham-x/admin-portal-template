export interface Menu {
  title: string
  menu_type: string
  header: number          
  is_active: number       
  position: number | null
}

export interface MenuView extends Menu {
  id: number
}
