import type { EnquiryView } from '@/types/cms/enquiry/Enquiry'
import type { APIPaginateResponse, APIResponseWithMessage } from '@/types/APIResponse'
import BaseAPIService from '@/services/BaseAPIService'

export default class EnquiryService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async paginate(params: any = {}, page: number = 1) {
    return this.query<APIPaginateResponse<EnquiryView[]>>(`enquiry?page=${page}`, { params })
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`enquiry/${id}`)
  }
}
