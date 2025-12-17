import type {
  AcademicYear,
  AcademicYearView,
} from '@/types/academic/year/AcademicYear'
import type { APIPaginateResponse, APIResponseWithMessage } from '@/types/APIResponse'
import BaseAPIService from '@/services/BaseAPIService'

export default class AcademicYearService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async paginate(data: any = {}, index: number) {
    return this.query<APIPaginateResponse<AcademicYearView[]>>(`academic-year?page=${index}`, { params: data })
  }

  async store(data: AcademicYear) {
    return this.post<APIResponseWithMessage>(data, 'academic-year')
  }

  async update(id: number, data: AcademicYear) {
    return this.put<APIResponseWithMessage>(data, `academic-year/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`academic-year/${id}`)
  }


}
