import BaseAPIService from '@/services/BaseAPIService'
import type { AdminUser, AdminUserView } from '@/types/adminUser/AdminUser'
import type { APIResponse, APIResponseWithMessage } from '@/types/APIResponse'
import type {
  UserCredentials,
  UserVerificationCredentials,
} from '@/types/auth/UserCredentials'

export default class AdminUserLoginService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async checkVerificationEnabled(data: UserCredentials) {
    return this.post<APIResponse<AdminUser>>(
      data,
      'check/verification-enabled',
    )
  }

  async checkLoginUser(data: UserCredentials) {
    return this.post<APIResponse<AdminUserView>>(data, 'login')
  }

  async doVerify() {
    return this.get<APIResponse<AdminUserView>>('do-verify')
  }

  async logout(data: any) {
    return this.post<APIResponseWithMessage>(data, 'logout')
  }

  async verifyMfaVerificationCode(data: UserVerificationCredentials) {
    return this.post<APIResponseWithMessage>(
      data,
      'verify/mfa-verification-code',
    )
  }

  async verifyEmailVerificationCode(data: UserVerificationCredentials) {
    return this.post<APIResponseWithMessage>(
      data,
      'verify/email-verification-code',
    )
  }

  async requestEmailVerificationCode(data: any) {
    return this.post<APIResponseWithMessage>(data, 'request/verification-code')
  }
}
