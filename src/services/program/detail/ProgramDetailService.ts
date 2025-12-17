import BaseAPIService from "@/services/BaseAPIService"
import type { APIResponseData, APIResponseWithMessage } from "@/types/APIResponse"
import type { ProgramDetail, ProgramDetailView } from "@/types/program/detail/ProgramDetail"

export default class ProgramDetailService extends BaseAPIService {
  constructor() {
    super("admin")
  }

  paginate(
    programId: number | string,
    params?: Record<string, string | number | boolean>,
  ) {
    return this.query<APIResponseData<ProgramDetailView[]>>(`program/${programId}/detail`, { params })
  }

  store(programId: number | string, data: ProgramDetail) {
    return this.post<APIResponseWithMessage>(data, `program/${programId}/detail`)
  }

  update(
    programId: number | string,
    detailId: number | string,
    data: ProgramDetail,
  ) {
    return this.put<APIResponseWithMessage>(data, `program/${programId}/detail/${detailId}`)
  }

  destroy(programId: number | string, detailId: number | string) {
    return this.delete<APIResponseWithMessage>(`program/${programId}/detail/${detailId}`)
  }

  async sortItems(programId: number | string, data: Array<{ id: number | string; position: number }>) {
    return this.post<APIResponseWithMessage>(data, `program/${programId}/detail/sort`)
  }
}
