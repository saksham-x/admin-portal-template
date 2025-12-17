import type { APIResponseWithMessage } from '@/types/APIResponse'
import BaseAPIService from '@/services/BaseAPIService'
import { convertFormData } from '@/utils/utils'
import type { Drone } from '@/types/drone/Drone'

export default class DroneService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async getAll(params: any= {}) {
    return this.query<Drone>('drone', { params })
  }

  async store(data: Drone) {
    return this.post<APIResponseWithMessage>(convertFormData(data), 'drone')
  }

  async update(id: number, data: Drone) {
    return this.post<APIResponseWithMessage>(convertFormData(data), `drone/${String(id)}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`drone/${String(id)}`)
  }
}