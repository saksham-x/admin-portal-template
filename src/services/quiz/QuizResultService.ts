import { QuizResultsResponse,  StartedQuizView, StudentAttemptResponse } from '@/types/quiz/QuizResult'
import BaseAPIService from "@/services/BaseAPIService"
import type { APIResponseData } from "@/types/APIResponse"

export default class QuizResultService extends BaseAPIService {
  constructor() { super("admin") }


  async listStartedQuizzes(params: Record<string, string | number | boolean> = {}) {
    return this.query<APIResponseData<StartedQuizView[]>>("quiz/started-quiz-list", { params })
  }
  async getQuizResults(quizId: number | string){
    return this.get<QuizResultsResponse>(`quiz/${quizId}/results`)
  }

  async getStudentAttempt(quizId: number | string, studentId: number | string) {
    return this.get<StudentAttemptResponse>(`quiz/${quizId}/student-attempt/${studentId}`)
  }

  async markManually(attempt_id: number | string, answerId: number | string, marks: number) {
    return this.post<{ message: string }>(
      { marks },
      `quiz-attempt/${attempt_id}/mark-manually/${answerId}`,
    )
  }
}
