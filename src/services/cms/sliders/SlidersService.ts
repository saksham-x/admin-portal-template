import BaseAPIService from '@/services/BaseAPIService'
import type { Slider, SliderView } from '@/types/cms/sliders/Sliders'
import type {  APIResponseData, APIResponseWithMessage } from '@/types/APIResponse'

export default class SliderService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async list(data: any = {} ) {
    return this.query<APIResponseData<SliderView[]>>(
      `slider`,
      { params: data },
    )
  }

  async store(data: Slider ) {
    return this.post<APIResponseWithMessage>(convertFormData(data), 'slider')
  }

  async update(id: number, data: Slider) {
    return this.post<APIResponseWithMessage>(convertFormData(data), `slider/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`slider/${id}`)
  }

  async sortItem(data: any) {
    return this.post<APIResponseWithMessage>(data, `slider/sort`)
  }
}
