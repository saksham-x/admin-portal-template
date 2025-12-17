import type {
  APIResponseData,
  APIPaginateResponse,
  APIResponseWithMessage,
} from "@/types/APIResponse"
import type { Grade, GradeSort, GradeView } from "@/types/grade/Grade"
import BaseAPIService from "@/services/BaseAPIService"

export default class GradeService extends BaseAPIService {
  constructor() {
    super("admin")
  }

  async getAllGrades(data: any = {}) {
    return this.query<APIPaginateResponse<GradeView[]>>(`grade`, {
      params: data,
    })
  }

  async show(id: number | string) {
    return this.get<APIResponseData<Grade>>(`grade/${id}`)
  }

  async store(data: Grade) {
    return this.post<APIResponseWithMessage>(data, "grade")
  }

  async update(id: number | string, data: Grade) {
    return this.put<APIResponseWithMessage>(data, `grade/${id}`)
  }

  async destroy(id: number | string) {
    return this.delete<APIResponseWithMessage>(`grade/${id}`)
  }

  async sortItems(data: GradeSort[]) {
    return this.post<APIResponseWithMessage>(
      data,
      "grade/sort",
    )
  }
}
