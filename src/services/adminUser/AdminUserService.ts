import {
  AdminUser,
  AdminUserView,
  MfaActivatePayload,
} from "@/types/adminUser/AdminUser"
import { convertFormData } from "@/utils/utils"
import BaseAPIService from "@/services/BaseAPIService"

export default class AdminUserService extends BaseAPIService {
  constructor() {
    super("admin")
  }

  async paginate(params: any = {}) {
    return this.query<AdminUserView[]>("admin-user", {
      params,
    })
  }

  async store(data: AdminUser) {
    return this.post<AdminUserView>(convertFormData(data), "admin-user")
  }

  async update(id: number, data: AdminUser) {
    return this.post<AdminUserView>(
      convertFormData(data),
      `admin-user/${id}`,
    )
  }

  async destroy(id: number) {
    return this.delete<{ message?: string }>(`admin-user/${id}`)
  }

  async getProfile() {
    return this.get<AdminUserView>("admin-user/profile")
  }

  async getMfaAuthenticator() {
    return this.get<{ account: string; secret_key: string; image_url: string }>(
      "mfa-authenticator",
    )
  }

  async activateEmailAuthenticator() {
    return this.post<AdminUserView>({}, "activate/email-authenticator")
  }

 
  async activateMfaAuthenticator(data: MfaActivatePayload) {
    return this.post<{ status: string }>(data, "activate/mfa-authenticator")
  }

  async deactivateEmailAuthenticator() {
    return this.post<AdminUserView>({}, "deactivate/email-authenticator")
  }

  async deactivateMfaAuthenticator() {
    return this.post<{ status: string }>({}, "deactivate/mfa-authenticator")
  }
}
