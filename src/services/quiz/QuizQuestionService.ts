import type { APIResponseWithMessage, APIResponseData } from "@/types/APIResponse"
import BaseAPIService from "@/services/BaseAPIService"
import type { QuizQuestionCreatePayload, QuizQuestionView } from "@/types/quiz/QuizQuestion"

export default class QuizQuestionService extends BaseAPIService {
  constructor() {
    super("admin")
  }

 
  // async list(quizId: number | string) {
  //   return this.get<APIResponseData<QuizQuestionView[]>>(`quiz/${quizId}/quiz-question`)
  // }

  async list(quizId: number | string, params?: Record<string, any>) {
    const queryString = params && Object.keys(params).length 
      ? '?' + new URLSearchParams(params).toString()
      : ''

    return this.get<APIResponseData<QuizQuestionView[]>>(`quiz/${quizId}/quiz-question${queryString}`)
  }

  async update(quizId: number | string, payload: QuizQuestionCreatePayload) {
    return this.post<APIResponseWithMessage>(payload, `quiz/${quizId}/quiz-question/update`)
  }
}
