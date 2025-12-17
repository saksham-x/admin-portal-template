import type { Course, CourseView } from "@/types/course/Course"
import type {
  APIPaginateResponse,
  APIResponseData,
  APIResponseWithMessage,
} from "@/types/APIResponse"
import BaseAPIService from "@/services/BaseAPIService"
import { convertFormData } from "@/utils/utils"

export default class CourseService extends BaseAPIService {
  constructor() {
    super("admin")
  }

  paginate(params?: Record<string, string | number | boolean>) {
    return this.query<APIResponseData<CourseView[]>>("course", { params })
  }

  show(id: number | string) {
    return this.get<APIResponseData<CourseView>>(`course/${id}`)
  }

  store(data: Course) {
    const hasFile = data.cover_image instanceof File

    return hasFile
      ? this.post<APIResponseWithMessage>(convertFormData(data), "course")
      : this.post<APIResponseWithMessage>(data, "course")
  }

  update(id: number | string, data: Course) {
    const hasFile = data.cover_image instanceof File

    return hasFile
      ? this.post<APIResponseWithMessage>(
        convertFormData(data),
        `course/${id}`,
      )
      : this.post<APIResponseWithMessage>(data, `course/${id}`)
  }

  destroy(id: number | string) {
    return this.delete<APIResponseWithMessage>(`course/${id}`)
  }
  getAllCourses(params?: Record<string, string | number | boolean>) {
    return this.query<APIPaginateResponse<CourseView[]>>("course/get/all", { params })
  }
}
