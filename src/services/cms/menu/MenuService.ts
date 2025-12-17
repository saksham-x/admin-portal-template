import { Menu, MenuView } from '@/types/cms/menu/Menu'
import BaseAPIService from '@/services/BaseAPIService'
import type { APIResponseData, APIResponseWithMessage } from '@/types/APIResponse'

export default class MenuService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async show(id: number) {
    return this.get<APIResponseData<MenuView>>(`menu/${id}`)
  }

  async list(params:any = {}) {
    return this.query<APIResponseData<MenuView[]>>('menu', { params })
  }

  async store(data: Menu) {
    return this.post<APIResponseData<MenuView[]>>(data, 'menu')
  }

  async update(id: number, data: Menu) {
    return this.put<APIResponseData<MenuView[]>>(data, `menu/${String(id)}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseData<MenuView[]>>(`menu/${String(id)}`)
  }

  async sortItems(data: MenuView[]) {
    return this.post<APIResponseWithMessage>(data, 'menu/sort')
  }
}
