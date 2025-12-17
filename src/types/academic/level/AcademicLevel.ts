export interface AcademicLevel {
  title: string
  level: string
  display_in_enrollment: boolean
  is_active: boolean
}

export interface AcademicLevelView extends AcademicLevel {
  id: number
  level_text: string
}
