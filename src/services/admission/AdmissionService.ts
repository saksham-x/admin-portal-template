// src/services/admission/AdmissionFormService.ts

import BaseAPIService from "@/services/BaseAPIService"
import type {
  APIPaginateResponse,
  APIResponseWithMessage,
} from "@/types/APIResponse"
import type { AdmissionFormView } from "@/types/admission/AdmissionForm"

export default class AdmissionFormService extends BaseAPIService {
  constructor() {
    super("admin")
  }

  async paginate(
    params: Record<string, string | number | boolean> = {},
    page = 1,
  ) {
    return this.query<APIPaginateResponse<AdmissionFormView>>(
      `admission-form/details?page=${page}`,
      { params },
    )
  }

  // GET admin/admission-forms/{id}/approve
  async approve(id: number) {
    return this.get<APIResponseWithMessage>(
      `admission-forms/${String(id)}/approve`,
    )
  }

  // GET admin/admission-forms/{id}/disapprove
  async disapprove(id: number) {
    return this.get<APIResponseWithMessage>(
      `admission-forms/${String(id)}/disapprove`,
    )
  }

  async show(id: number) {
    return this.get<{ status: string; data: AdmissionFormView }>(`admission-form/${id}`)
  }
}
