import BaseAPIService from '@/services/BaseAPIService'
import type { APIPaginateResponse, APIResponseWithMessage } from '@/types/APIResponse'
import type { Blog } from '@/types/cms/blog/Blog'
import { convertFormData } from '@/utils/utils'

export default class BlogService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async paginate(
    params:any = {},
    index:number,
  ) {
    return this.query<APIPaginateResponse<Blog[]>>(`blog?page=${index}`, { params })
  }

  async store(data: Blog) {
    return this.post<APIResponseWithMessage>(convertFormData(data), 'blog')
  }

  async update(id: number, data: Blog) {
    return this.post<APIResponseWithMessage>(convertFormData(data), `blog/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`blog/${id}`)
  }


}
