import {
  APIPaginateResponse,
  APIResponseData,
  APIResponseWithMessage,
} from "@/types/APIResponse"
import BaseAPIService from "../BaseAPIService"
import { Quiz, QuizView } from "@/types/quiz/Quiz"

export default class QuizService extends BaseAPIService {
  constructor() {
    super("admin")
  }

  async paginate(data: any = {}, index: number = 1) {
    return this.query<APIPaginateResponse<QuizView[]>>(`quiz?page=${index}`, {
      params: data,
    })
  }

  async show(id: number | string) {
    return this.get<APIResponseData<QuizView>>(`quiz/${id}`)
  }

  async store(data: Quiz) {
    return this.post<APIResponseData<QuizView>>(data, "quiz")
  }

  async update(id: number, data: Quiz) {
    return this.put<APIResponseWithMessage>(data, `quiz/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`quiz/${id}`)
  }

  async clone(id: number) {
    return this.get<APIResponseWithMessage>(`quiz/${id}/clone`)
  }
}
