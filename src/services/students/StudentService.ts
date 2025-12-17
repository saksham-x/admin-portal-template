import type { APIPaginateResponse, APIResponseData, APIResponseWithMessage, APIResponseWithURL } from '@/types/APIResponse'
import type { StudentCreate, StudentUpdate, StudentView } from '@/types/student/Student'
import BaseAPIService from '@/services/BaseAPIService'
import { CourseView } from '@/types/course/Course'
import { StudentQuizHistoryResponse } from '@/types/student/StudentQuizHistorySummary'

export default class StudentService extends BaseAPIService {
  constructor() {
    super('admin')
  }

  async paginate(data: any = {}, index: number) {
    return this.query<APIPaginateResponse<StudentView[]>>(`student?page=${index}`, { params: data })
  }

  async show(id: number | string) {
    return this.get<APIResponseData<StudentView>>(`student/${id}`)
  }

  async store(data: StudentCreate | FormData) {
    return this.post<APIResponseWithMessage>(data as any, 'student')
  }

  async update(id: number, data: StudentUpdate | FormData) {
    return this.post<APIResponseWithMessage>(data as any, `student/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`student/${id}`)
  }


  async approved(id: number, data?: any) {
    return this.post<APIResponseWithMessage>(data, `student/${id}/approve`)
  }

  async disapproved(id: number, data?: any) {
    return this.post<APIResponseWithMessage>(data, `student/${id}/disapprove`)
  }

  async getAllCourses(id: number) {
    return this.get<APIResponseData<CourseView[]>>(`student/${id}/courses`)
  }

  async getStudentQuizHistory(id: number){
    return this.get<StudentQuizHistoryResponse>(`student/${id}/quiz-history`)
  }
  async updateStudentCourseAccess(id: number, courseId: number, data?: any) {
    return this.post<APIResponseWithMessage>(data, `student/${id}/courses/${courseId}/update-access`)
  }

  async importStudents(classroomId: number | string, file: File) {
    return this.post<APIResponseWithMessage>(convertFormData({ file: file }), `classroom/${classroomId}/students/import`)
  }

  async exportStudents(classroomId: number | string) {
    return this.query<Blob>(`classroom/${classroomId}/students/export`, {
      responseType: 'blob',
    } as any)
  }

  async loginAsStudent(id: number){
    return this.get<APIResponseWithURL>(`student/${id}/login-as-student`)
  }

}
