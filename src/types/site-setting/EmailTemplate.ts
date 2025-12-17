
export interface EmailTemplate {
  title: string
  role: string | null
  subject: string | null
  description: string
  type: string | null
  is_active: number | boolean
  identifier: string | null
  accepted_inputs: string | null
}

export interface EmailTemplateView extends EmailTemplate {
  id: number
}
export type EmailTemplateRoleOption = [string, string]