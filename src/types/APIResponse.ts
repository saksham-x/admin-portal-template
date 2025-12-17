export interface APIResponseData<T> {
  data: T
  errors?: string | Record<string, string[]>
}

export interface APIResponse<T> extends APIResponseData<T> {
  status: string
  message: string
}

export interface APIResponseWithMessage {
  status: string
  message: string
}

export interface APIResponseWithURL extends APIResponseWithMessage {
  url: string

}
export interface APIPaginateResponse<T> {
  data: T
  meta: {
    total: number
    page: number
    per_page: number
    last_page: number
    current_page: number }
}
