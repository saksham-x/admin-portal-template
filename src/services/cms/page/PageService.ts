import type { Page } from "@/types/cms/page/Page"
import type {  APIResponseData, APIResponseWithMessage } from "@/types/APIResponse"
import BaseAPIService from "@/services/BaseAPIService"

export default class PageService extends BaseAPIService {
  constructor() {
    super("admin")
  }

  async list(params:any = {}) {
    return this.query<APIResponseData<Page[]>>(`page`, { params })
  }

  async show(id: number) {
    return this.get<{ data: Page }>(`page/${id}`)
  }

  async store(data: Page) {
    return this.post<APIResponseWithMessage>(data, "page")
  }

  async update(id: number, data: Page) {
    return this.put<APIResponseWithMessage>(data, `page/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`page/${id}`)  
  }
  
  async sortItems(data: any) {
    return this.post<APIResponseWithMessage>(data, "page/sort")
  }
}
