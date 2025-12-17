import { Imagepath } from "../FilePath"

export interface Course {
  title: string
  level_id: number
  program_id: number
  program_name?: string  
  year_id: number
  grade_id?: number | null
  grade?: string
  cover_image?: File | null
  subject_code?: string | null
  description?: string | null
  duration?: number | null
   duration_unit?: 'day' | 'hours' | 'weeks' | 'months' | null
  mark_type?: string | null
  theory_mark?: number | null
  theory_credit_hours?: number | null
  theory_grade_points?: number | null
  theory_pass_mark?: number | null
  has_practical?: boolean
  practical_mark?: number | null
  practical_credit_hours?: number | null
  practical_grade_points?: number | null
  practical_pass_mark?: number | null
  is_optional?: boolean
  is_visible?: boolean
  is_internal?: boolean
  is_active: boolean
}

export interface CourseView extends Course {
  id: number
  image_path?: Imagepath
  feature_image_path: Imagepath
}