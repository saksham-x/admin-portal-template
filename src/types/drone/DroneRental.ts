export interface RentalEnquiry {
  full_name: string
  email: string
  phone: string
  drone_id: number
  preferred_date: string
  hire_duration: string
  project_location: string
  project_details: string | null
  mark_as_read: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface RentalEnquiryView extends RentalEnquiry {
  id: number
}