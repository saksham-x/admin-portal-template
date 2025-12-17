import type {
  APIResponseData,
  APIResponseWithMessage,
} from "@/types/APIResponse"
import BaseAPIService from "@/services/BaseAPIService"
import { MenuItem } from "@/types/cms/menu/items/MenuItems"

export default class MenuItemService extends BaseAPIService {
  constructor() {
    super("admin")
  }

  async list(
    menuId: number,
    params:any = {},
  ) {
    return this.query<APIResponseData<MenuItem[]>>(
      `menu/${menuId}/menu-item`,
      { params },
    )
  }

  async store(menuId: number, data: MenuItem) {
    return this.post<MenuItem>(data, `menu/${menuId}/menu-item`)
  }

  async update(menuId: number, itemId: number, data: MenuItem) {
    return this.put<MenuItem>(data, `menu/${menuId}/menu-item/${itemId}`)
  }

  async destroy(menuId: number, itemId: number) {
    return this.delete<{ message?: string }>(
      `menu/${menuId}/menu-item/${itemId}`,
    )
  }

  async sortItems(menuId: number, data: any) {
    return this.post<APIResponseWithMessage>(
      data,
      `menu/${menuId}/menu-item/sort`,
    )
  }
}
