import type { BlogCategory } from "@/types/cms/blog/category/BlogCategory"
import type {  APIResponseData, APIResponseWithMessage } from '@/types/APIResponse'
import BaseAPIService from '@/services/BaseAPIService'
import { convertFormData } from '@/utils/utils'

export default class BlogCategoryService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async paginate(params: any = {}) {
    return this.query<APIResponseData<BlogCategory[]>>(`blog-category`, { params })
  }

  async store(data: BlogCategory) {
    return this.post<APIResponseWithMessage>(convertFormData(data), 'blog-category')
  }

  async update(id: number, data: BlogCategory) {
    // const payload = convertFormData({ ...(data as any), _method: 'PUT' })
    return this.post<APIResponseWithMessage>(convertFormData(data), `blog-category/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`blog-category/${id}`)
  }
  
  async sortItems(data:any) {
    return this.post<APIResponseWithMessage>(data, 'blog-category/sort')
  }

}
