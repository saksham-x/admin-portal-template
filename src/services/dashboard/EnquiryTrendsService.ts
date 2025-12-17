import BaseAPIService from '@/services/BaseAPIService'
import type { APIResponseData } from '@/types/APIResponse'
import type { EnquiryTrendsData, TimeframeType } from '@/types/dashboard/EnquiryTrends'

export default class EnquiryTrendsService extends BaseAPIService {
  constructor() {
    super('admin/dashboard')
  }

  async getTrends(groupBy: TimeframeType, year?: number) {
    const params: Record<string, string | number> = {
      group_by: groupBy,
    }

    if (year && (groupBy === 'day' || groupBy === 'month')) {
      params.start_date = year
    }

    return this.query<APIResponseData<EnquiryTrendsData>>('enquiry-trends', { params })
  }
}