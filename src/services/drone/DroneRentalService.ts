import type { RentalEnquiryView } from '@/types/drone/DroneRental'
import type { APIPaginateResponse } from '@/types/APIResponse'
import BaseAPIService from '@/services/BaseAPIService'

export default class RentalEnquiryService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async paginate(data: any = {}, page: number) {
    return this.query<APIPaginateResponse<RentalEnquiryView[]>>(`drone-enquiry?page=${page}`, { params: data })
  }
  async markAsRead(id: number) {
    return this.post(`drone-enquiry/${id}/markasread`)
  }
}