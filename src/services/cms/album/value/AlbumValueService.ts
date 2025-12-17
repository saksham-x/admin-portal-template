import type { AlbumValue, AlbumValueView } from '@/types/cms/album/value/AlbumValue'
import type { APIResponseData, APIResponseWithMessage } from '@/types/APIResponse'
import BaseAPIService from '@/services/BaseAPIService'
import { convertFormData } from '@/utils/utils'

export default class AlbumValueService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async list(albumId: number | string) {
    return this.query<APIResponseData<AlbumValueView[]>>(`album/${albumId}/value`)
  }

  async store(albumId: number, data: AlbumValue) {
    return this.post<APIResponseWithMessage>(convertFormData(data), `album/${albumId}/value`)
  }

  async update(albumId: number | string, id: number, data: AlbumValue) {
    return this.post<APIResponseWithMessage>(convertFormData(data), `album/${albumId}/value/${id}`)
  }

  async destroy(albumId: number | string, id: number) {
    return this.delete<APIResponseWithMessage>(`album/${albumId}/value/${id}`)
  }

  async sortItems(albumId: number | string, data: any) {
    return this.post<APIResponseWithMessage>(data, `album/${albumId}/value/sort`)
  }
}