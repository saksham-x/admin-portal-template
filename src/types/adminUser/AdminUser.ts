export interface AdminUser {
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  mobile: string | null
  phone: string | null
  username: string | null
  email: string | null
  password?: string 
  address: string | null
  user_type: string | null
  is_active: boolean
}

export interface AdminUserView extends Omit<AdminUser, 'password'> {
  id: number
  is_mfa_enabled: boolean
  is_email_authentication_enabled: boolean
  last_logged_in: string | null
  remember_token: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  full_name: string
}

export interface MfaActivatePayload {
  verification_code: string
  secret_key: string
  image_url: string
}
