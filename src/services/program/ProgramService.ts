import type { Program, ProgramSort, ProgramView } from '@/types/program/Program'
import { APIResponseData, type APIResponseWithMessage } from '@/types/APIResponse'
import BaseAPIService from '@/services/BaseAPIService'
import { convertFormData } from '@/utils/utils'

export default class ProgramService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  paginate(params: Record<string, any> = {}, page = 1) {
    return this.query<APIResponseData<ProgramView[]>>(`program`, {
      params: { ...params, page },
    })
  }


  async show(id: number | string) {
    return this.get<APIResponseData<ProgramView>>(`program/${id}`)
  }

  async store(data: Program) {
    const payload = convertFormData(data)

    return this.post<APIResponseWithMessage>(payload, 'program')
  }

  async update(id: number, data: Program) {
    const payload = convertFormData(data)
    
    return this.post<APIResponseWithMessage>(payload, `program/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`program/${id}`)
  }

  async sortItems(data: ProgramSort[]) {
    return this.post<APIResponseWithMessage>(data, 'program/get/sort')
  }

}
