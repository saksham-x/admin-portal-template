import BaseAPIService from '@/services/BaseAPIService'
import type {  APIResponseData, APIResponseWithMessage } from '@/types/APIResponse'
import type { FaqCategory, FaqCategoryView } from '@/types/cms/faq/category/FaqCategory'

export default class FaqCategoryService extends BaseAPIService {
  constructor() {
    super('admin')
  }
  async list(params:any = {}) {
    return this.query<APIResponseData<FaqCategory>>(`faq-category`, { params })
  }

  async store(data: FaqCategory) {
    return this.post<APIResponseWithMessage>(data, 'faq-category')
  }

  async update(id: number, data: FaqCategory) {
    return this.put<APIResponseWithMessage>(data, `faq-category/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`faq-category/${id}`)
  }

  async sortItems(data: FaqCategoryView[]) {
    return this.post<APIResponseWithMessage>(data, 'faq-category/sort')
  }
}
