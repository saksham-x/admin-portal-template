export interface UserCredentials {
  email: string
  password: string
  token: string
}

export interface UserVerificationCredentials {
  email: string
  password: string
  verification_code: string
  token: string
}
