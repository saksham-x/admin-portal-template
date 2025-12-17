import type { OurService } from "@/types/cms/our-service/OurService"
import BaseAPIService from "@/services/BaseAPIService"
import { APIResponseWithMessage } from "@/types/APIResponse"

export default class OurServiceService extends BaseAPIService {
  constructor() {
    super("admin")
  }

  async list(data: any = {}) {
    return this.query<{ data: OurService[] }>(`service`, {
      params: data,
    })
  }
  async store(data: OurService) {
    return this.post<APIResponseWithMessage>(convertFormData(data), "service")
  }
 
  async update(id: number, data: OurService) {
    return this.post<APIResponseWithMessage>(convertFormData(data), `service/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`service/${id}`)
  }
  
  async sortItems(data: OurService[]) {
    return this.post<APIResponseWithMessage>(data, "service/sort")
  }
}
