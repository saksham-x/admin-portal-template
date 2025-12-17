import BaseAPIService from "@/services/BaseAPIService"
import type {
  APIPaginateResponse,
  APIResponseWithMessage,
} from "@/types/APIResponse"
import type {
  EmailTemplate,
  EmailTemplateView,
  EmailTemplateRoleOption,
} from "@/types/site-setting/EmailTemplate"
import { convertFormData } from "@/utils/utils"

export default class EmailTemplateService extends BaseAPIService {
  constructor() {
    super("admin")
  }

  async paginate(params: any, index:number) {
    return this.query<APIPaginateResponse<EmailTemplateView[]>>(
      `email-template?page=${index}`,
      { params },
    )
  }

  async store(data: EmailTemplate) {
    return this.post<APIResponseWithMessage>(
      convertFormData(data),
      "email-template",
    )
  }

  async update(id: number, data: EmailTemplate) {
    return this.post<APIResponseWithMessage>(
      convertFormData(data),
      `email-template/${id}`,
    )
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`email-template/${id}`)
  }

  async roles() {
    return this.query<EmailTemplateRoleOption[]>("email-template-roles")
  }
}
