
import BaseAPIService from '@/services/BaseAPIService'
import type { NewsAndUpdate, NewsAndUpdateView } from '@/types/cms/news-and-update/NewsAndUpdate'
import type { APIPaginateResponse, APIResponseWithMessage } from '@/types/APIResponse'
import { convertFormData } from '../../../utils/utils'

export default class NewsAndUpdateService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async paginate(data: any = {}, index: number) {
    return this.query<APIPaginateResponse<NewsAndUpdateView[]>>(
      `news-and-update?page=${index}`,
      { params: data },
    )
  }

  async store(data: NewsAndUpdate ) {
    return this.post<APIResponseWithMessage>(convertFormData(data), 'news-and-update')
  }

  async update(id: number, data: NewsAndUpdate) {
    return this.post<APIResponseWithMessage>(convertFormData(data), `news-and-update/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`news-and-update/${id}`)
  }
}
