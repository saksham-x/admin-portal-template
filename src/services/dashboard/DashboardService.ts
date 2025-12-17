import BaseAPIService from '@/services/BaseAPIService'
import type { DashboardStats } from '@/types/dashboard/DashboardStats'
import type { APIResponseData } from '@/types/APIResponse'

export default class DashboardService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async stats() {
    return this.get<APIResponseData<DashboardStats>>('dashboard')
  }
}
