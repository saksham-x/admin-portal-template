export interface AcademicYear {
  title: string
  year: string
  is_active: boolean
  is_current_year: boolean
  is_complete: boolean
  complete_date: string 
}

export interface AcademicYearView extends AcademicYear {
  id: number
}