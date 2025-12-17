import {
  APIResponseData,
  type APIPaginateResponse,
  type APIResponseWithMessage,
} from "@/types/APIResponse"
import BaseAPIService from "@/services/BaseAPIService"
import { QuestionBank, QuestionBankView } from "@/types/question/QuestionBank"
import axios from 'axios'

export default class QuestionBankService extends BaseAPIService {
  constructor() {
    super("admin")
  }

  async paginate(data: any = {}, index: number) {
    return this.query<APIPaginateResponse<QuestionBankView[]>>(
      `question-banks?page=${index}`,
      { params: data },
    )
  }

  async show(id: number | string) {
    return this.get<APIResponseData<QuestionBankView>>(`question-banks/${id}`)
  }

  async store(data: QuestionBank) {
    return this.post<APIResponseWithMessage>(data, "question-banks")
  }

  async update(id: number, data: QuestionBank) {
    return this.put<APIResponseWithMessage>(data, `question-banks/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`question-banks/${id}`)
  }

  async clone(id: number) {
    return this.post<APIResponseWithMessage>({}, `question-banks/${id}/clone`)
  }

  async exportQuestions(id: number) {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/admin/question-banks/${id}/questions/export-csv`,
      {
        responseType: 'blob',
        headers: {
          'Accept': 'text/csv',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        withCredentials: true,
      },
    )
  
    return response
  }
}
