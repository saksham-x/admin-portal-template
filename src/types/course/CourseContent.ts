export interface CourseContent {
  title: string
  description?: string | null
  content_type?: string | null
  content_url?: string | null
  body?: string | null
  duration_minutes?: number | null
  position?: number | null
  is_published?: boolean
  attachments?: File[] | null
}

export interface CourseContentAttachment {
  id: number
  course_content_id: number
  file_name: string
  file_path: string
  file_type: string | null
  file_size: number | null
  file_path_link: {
    original: string
    thumb?: string
  }
  is_active: boolean
}
export interface CourseContentView extends Omit<CourseContent, "attachments"> {
  id: number
  course_id: number
  slug: string
  attachments: CourseContentAttachment[]
}
