export interface Grade {
  title: string
  program_id: number
  is_active: boolean
}

export interface GradeView extends Grade {
  id: number
  program_title: string
}

export interface GradeSort {
  id: number
}
