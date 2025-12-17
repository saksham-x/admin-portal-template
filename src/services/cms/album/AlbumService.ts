import BaseAPIService from '@/services/BaseAPIService'
import type {  APIResponseData, APIResponseWithMessage } from '@/types/APIResponse'
import type { Album } from '@/types/cms/album/Album'
import { convertFormData } from '@/utils/utils'

export default class AlbumService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async list(
    params: any = {},
  ) {
    return this.query<APIResponseData<Album[]>>(`album`, { params })
  }
  async show(id: string | number) {
    return this.query<APIResponseData<Album>>(`album/${id}`)
  }

  
  async store(data: Album) {
    return this.post<APIResponseWithMessage>(convertFormData(data), 'album')
  }

  async update(id: number, data: Album) {
    return this.post<APIResponseWithMessage>(convertFormData(data), `album/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`album/${id}`)
  }

  async sortItems(data: any) {
    return this.post<APIResponseWithMessage>(data, 'album/sort')
  }
}