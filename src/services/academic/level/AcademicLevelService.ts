import type { AcademicLevel, AcademicLevelView } from '@/types/academic/level/AcademicLevel'
import type { APIPaginateResponse, APIResponseWithMessage } from '@/types/APIResponse'
import BaseAPIService from '@/services/BaseAPIService'

export default class AcademicLevelService extends BaseAPIService {
  constructor() {
    super('admin')
  }



  async paginate(params: Record<string, string | number | boolean | null> = {}, page = 1) {
    return this.query<APIPaginateResponse<AcademicLevelView[]>>(
      `academic-level?page=${page}`,
      { params },
    )
  }

  
  async store(data: AcademicLevel) {
    return this.post<APIResponseWithMessage>(data, 'academic-level')
  }

  async update(id: number, data: AcademicLevel) {
    return this.put<APIResponseWithMessage>(data, `academic-level/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`academic-level/${id}`)
  }

  async sortItems(data: AcademicLevelView[]) {
    return this.post<APIResponseWithMessage>(data, 'academic-level/sort')
  }
}
