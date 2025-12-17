export type StudentStatus = "approved" | "pending" | "disapproved";

export interface StudentCreate {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  mobile: string;
  phone?: string | null;

  // username: string
  email: string;
  password: string;
  password_confirmation: string;
  date_of_birth: string;
  date_of_birth_bs?: string | null;
  grade_id: number;
  program_id: number;
  blood_group?: string | null;
  symbol_no?: string | null;
  id_card_address?: string | null;
  joining_date: string;
  address?: string | null;
  status?: StudentStatus;
  academic_year_id: number;
  classroom_id: number;
  secondary_email?: string | null;
  level_id: number;
  image_file ?: File | File[] | null;
}
export type StudentUpdate = Partial<StudentCreate>;
export interface StudentView {
  id: number;
  full_name: string;
  phone: string | null;
  mobile?: string | null;

  // username: string
  email: string;
  date_of_birth_bs: string | null;
  secondary_email: string | null;
  date_of_birth: string | null;
  joining_date: string | null;
  address: string | null;
  status: StudentStatus;
  academic_year_id: number | null;
  grade_id: number | null;
  program_id: number | null;
  classroom_id: number | null;
  level_id?: number | null;
  blood_group: string | null;
  id_card_address: string | null;
  symbol_no: string | null;
  is_active: 0 | 1 | boolean;
  image?: string | null;
  image_path: {
    original: string;
    thumb: string;
  } | null;
  approved_from: string;

  // Related data from API
  academic_year?: string | null;
  grade?: string | null;
  program?: string | null;
  level?: string | null;
  classroom?: string[] | null;
  courses?: string[] | null;

  academic_year_title?: string | null;
  grade_title?: string | null;
  program_title?: string | null;
  classroom_name?: string | null;

  course?: string[];
}
