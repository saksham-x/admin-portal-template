import {  APIResponseData,  type APIResponseWithMessage } from "@/types/APIResponse"
import BaseAPIService from "@/services/BaseAPIService"
import { convertFormData } from "@/utils/utils"
import { Team, TeamView } from "@/types/cms/team/Team"

export default class TeamService extends BaseAPIService {
  constructor() {
    super("admin")
  }

  async list(data: any = {}) {
    return this.query<APIResponseData<TeamView[]>>(`team`, {
      params: data,
    })
  }

  async show(id: number | string) {
    return this.get<APIResponseData<TeamView>>(`team/${id}`)
  }

  async store(data: Team) {
    const payload = convertFormData(data)

    return this.post<APIResponseWithMessage>(payload, "team")
  }

  async update(id: number, data: Team) {
    const payload = convertFormData(data)

    return this.post<APIResponseWithMessage>(payload, `team/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`team/${id}`)
  }

  async sortItems(data: TeamView[]) {
    return this.post<APIResponseWithMessage>(data, "team/get/sort")
  }
}
