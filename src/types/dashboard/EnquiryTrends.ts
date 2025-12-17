export type TimeframeType = 'day' | 'month' | 'year'

export interface EnquiryTrendItem {
  day?: string
  month?: string
  year?: string
  count: number
}

export interface EnquiryTrendsData {
  enquiry_trends: EnquiryTrendItem[]
}