export interface StudentStats {
  total_students: number
  full_name: string | null
  image_path: string | null
  symbol_label: string | null
}

export interface AdmissionFormStats {
  count: number
  pending: number | null
  approved: number | null
  disapproved: number | null
}

export interface QuizStats {
  total_quizzes: number
  active_quizzes: number | null
  inactive_quizzes: number | null
  ongoing_quizzes: number | null
}

export interface DashboardStats {
  student_stats: StudentStats
  admissionFormData: AdmissionFormStats
  classroom_counts: number
  quiz_stats: QuizStats
  course_counts: number
  program_counts: number
}
