// export interface AdmissionForm {
//   first_name: string;
//   middle_name: string | null;
//   last_name: string;
//   email: string;
//   academic_year_id: number;
//   grade_id: number;
//   program_id: number;
//   level_id: number;
//   student_id: number | null;
//   status: string;
//   is_active: number;
//   citizenship_document_path: {
//     original: string;
//     thumb: string;
//   } | null;
//   created_by: number | null;
//   deleted_at: string | null;
//   created_at: string;
//   updated_at: string;
// }

// export interface AdmissionFormView extends AdmissionForm {
//   id: number;
// }
export interface AdmissionForm {
  first_name: string
  middle_name: string | null
  last_name: string
  full_name: string
  email: string
  phone: string
  academic_year_id: number
  academic_year_title: string
  grade_id: number
  grade_title: string
  program_id: number
  program_title: string
  level_id: number
  level_title: string
  student_id: number | null
  status: string
  position: number | null
  is_active: boolean
  citizenship_document_path: {
    original: string
    thumb: string
  } | null
  created_by: number | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface AdmissionFormView extends AdmissionForm {
  id: number
}