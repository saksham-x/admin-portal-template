import type { APIResponseData } from '@/types/APIResponse'
import BaseAPIService from '@/services/BaseAPIService'
import type { AcademicYearView } from '@/types/academic/year/AcademicYear'
import type { AcademicLevelView } from '@/types/academic/level/AcademicLevel'

export default class AcademicService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async getAllAcademicYears() {
    return this.get<APIResponseData<AcademicYearView[]>>('academic-year/get/all')
  }


  async getAllAcademicLevels() {
    return this.get<APIResponseData<AcademicLevelView[]>>('academic-level/get/all')
  }
}
