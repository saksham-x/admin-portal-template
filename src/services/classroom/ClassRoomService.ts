import type {
  APIPaginateResponse,
  APIResponseData,
  APIResponseWithMessage,
} from '@/types/APIResponse'
import BaseAPIService from '@/services/BaseAPIService'
import type { Classroom, ClassroomSummary, ClassroomView } from '@/types/classroom/Classroom'
import type { StudentView } from '@/types/student/Student'
import type { CourseView } from '@/types/course/Course'

export default class ClassroomService extends BaseAPIService {
  constructor() {
    super('admin')
  }


  async paginate(data: any = {}, index: number) {
    return this.query<APIPaginateResponse<ClassroomView[]>>(
      `classroom?page=${index}`, 
      { params: data },
    )
  }
  async show(id: number | string) {
    return this.get<APIResponseData<ClassroomView>>(`classroom/${id}`)
  }

  async store(data: Classroom) {
    return this.post<APIResponseData<ClassroomView>>(data, 'classroom')
  }

  async update(id: number, data: Classroom) {
    return this.put<APIResponseWithMessage>(data, `classroom/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`classroom/${id}`)
  }

  async sortItems(data: ClassroomView[]) {
    return this.post<APIResponseWithMessage>(data, 'classroom/sort')
  }

  async assignStudents(id: number | string, studentIds: number[]) {
    return this.post<APIResponseWithMessage>(
      { student_ids: studentIds },
      `classroom/${id}/assign-students`,
    )
  }

  async removeStudent(classroomId: number, studentId: number) {
    return this.post<APIResponseWithMessage>(
      { student_id: studentId },
      `classroom/${classroomId}/remove-student`,
    )
  }

  async listStudents(id: number | string, params: Record<string, any> = {}) {
    return this.query<APIResponseData<StudentView[]>>(`classroom/${id}/students`, {
      params,
    })
  }

  async assignCourses(id: number | string, courseIds: number[]) {
    return this.post<APIResponseWithMessage>(
      { course_ids: courseIds },
      `classroom/${id}/assign-courses`,
    )
  }

  async listCourses(id: number | string, params: Record<string, any> = {}) {
    return this.query<APIResponseData<CourseView[]>>(`classroom/${id}/courses`, {
      params,
    })
  }
  async removeCourse(classroomId: number, courseId: number) {
    return this.post<APIResponseWithMessage>(
      { course_id: courseId },
      `classroom/${classroomId}/remove-course`,
    )
  }
  async listAll() {
    return this.get<APIResponseData<ClassroomSummary[]>>('classroom/all')
  }

  async importStudents(id: number | string, file: File) {
    return this.post<APIResponseWithMessage>(
      convertFormData({ file }), 
      `classroom/${id}/import-students`,
    )
  }

  async exportStudents(id: number | string) {
    return this.query<Blob>(
      `classroom/${id}/export-students`, 
    { responseType: 'blob' } as any,
    )
  }
}
