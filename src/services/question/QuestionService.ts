import type { Question, QuestionView } from "@/types/question/Question"
import {
  APIResponseData,
  type APIPaginateResponse,
  type APIResponseWithMessage,
} from "@/types/APIResponse"
import BaseAPIService from "@/services/BaseAPIService"
import { convertFormData } from "@/utils/utils"


// type QuestionImportResponse =
//   | { success: true; message: string }
//   | { success: false; message: { row: number; errors: string[] }[] }

export default class QuestionService extends BaseAPIService {
  constructor() {
    super("admin")
  }
  async paginate(data: any = {}, index: number) {
    return this.query<APIPaginateResponse<QuestionView[]>>(
      `question?page=${index}`,
      { params: data },
    )
  }

  async show(id: number | string) {
    return this.get<APIResponseData<QuestionView>>(`question/${id}`)
  }

  async store(data: Question) {
    return this.post<APIResponseWithMessage>(convertFormData(data), "question")
  }

  async update(id: number, data: Question) {
    return this.post<APIResponseWithMessage>(convertFormData(data), `question/${id}`)
  }


  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`question/${id}`)
  }

  async importCsv(questionBankId: number | string, file: File) {
    const fd = new FormData()

    fd.append("csv_file", file)

    return this.post<APIResponseWithMessage>(
      fd,
      `question-banks/${questionBankId}/questions/import-csv`,
    )
  }
}
