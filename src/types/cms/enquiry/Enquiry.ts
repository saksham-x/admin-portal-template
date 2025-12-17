// export interface Enquiry {
//   name: string
//   email: string
//   message: string
//   subject?: string
//   phone?: string
//   created_at: string
//   updated_at: string
// }

// export interface EnquiryView extends Enquiry {
//   id: number
//   mark_as_read?: number | boolean
//   deleted_at?: string | null
// }

export interface Enquiry {
  id: number
  name: string
  email: string
  subject: string | null
  phone: string | null
  message: string
  mark_as_read?: number | boolean
  deleted_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface EnquiryView extends Enquiry {
  id: number
}