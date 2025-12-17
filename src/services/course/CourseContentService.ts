import type { CourseContent, CourseContentView } from "@/types/course/CourseContent"
import type { APIResponseData, APIResponseWithMessage } from "@/types/APIResponse"
import BaseAPIService from "@/services/BaseAPIService"
import { convertFormData } from '@/utils/utils'

export default class CourseContentService extends BaseAPIService {
  constructor() {
    super("admin")
  }

  list(courseId: number | string, params?: Record<string, string | number | boolean>) {
    return this.query<APIResponseData<CourseContentView[]>>(`course/${courseId}/contents`, { params })
  }

  async show(courseId: number | string, id: number | string) {
    return this.get<APIResponseData<CourseContentView>>(`course/${courseId}/contents/${id}`)
  }

  async store(courseId: number | string, data: CourseContent) {
    const payload = convertFormData(data)
    
    return this.post<APIResponseWithMessage>(payload, `course/${courseId}/contents`)
  }

  async update(courseId: number | string, id: number | string, data: CourseContent) {
    const payload = convertFormData(data)
    
    return this.post<APIResponseWithMessage>(payload, `course/${courseId}/contents/${id}`)
  }
  async destroy(courseId: number | string, id: number | string) {
    return this.delete<APIResponseWithMessage>(`course/${courseId}/contents/${id}`)
  }

  async sortItems(courseId: number | string, data: any[]) {
    return this.post<APIResponseWithMessage>(data, `course/${courseId}/contents/sort`)
  }
}