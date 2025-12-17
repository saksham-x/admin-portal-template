import BaseAPIService from '@/services/BaseAPIService'
import type {  APIResponseWithMessage, APIResponseData } from '@/types/APIResponse'
import type { Faq } from '@/types/cms/faq/Faq'


export default class FAQService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async list(params: any = {}) {
    return this.query<APIResponseData<Faq>>(`faq`, { params })
  }

  async store(data: Faq) {
    return this.post<APIResponseWithMessage>(data, 'faq')
  }

  async update(id: number, data: Faq) {
    return this.put<APIResponseWithMessage>(data, `faq/${String(id)}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`faq/${String(id)}`)
  }

  async sortItems(data: Faq[]) {
    return this.post<APIResponseWithMessage>(data, 'faq/sort')
  }
}
