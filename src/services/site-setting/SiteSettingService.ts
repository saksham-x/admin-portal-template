import BaseAPIService from "@/services/BaseAPIService"
import type { APIResponse, APIResponseWithMessage, APIResponseWithURL } from "@/types/APIResponse"
import type { SiteSettingView } from "@/types/site-setting/SiteSetting"

export default class SiteSettingService extends BaseAPIService {
  constructor() {
    super("admin")
  }

  getSetting() {
    return this.get<APIResponse<SiteSettingView>>("site-setting")
  }

  update(id: string | number, data: FormData | Partial<SiteSettingView>) {
    return this.post<APIResponseWithMessage>(data, `site-setting/${id}`)
  }

  uploadStorageTestFile(data: FormData) {
    return this.post<APIResponseWithURL>(data, "site-setting/s3/test")
  }

  testSMTP(data: FormData) {
    return this.post<APIResponseWithURL>(data, "site-setting/smtp/test-email")
  }

  activateAdmissionForm() {
    return this.post<APIResponseWithMessage>({}, "admission-form/activate")
  }

  deactivateAdmissionForm() {
    return this.post<APIResponseWithMessage>({}, "admission-form/deactivate")
  }
}
