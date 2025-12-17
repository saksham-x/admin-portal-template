import type { Popup, PopupView } from "@/types/cms/popup/Popup"
import type {
  APIResponseData,
  APIResponseWithMessage,
} from "@/types/APIResponse"
import { convertFormData } from "@/utils/utils"
import BaseAPIService from "@/services/BaseAPIService"

export default class PopupService extends BaseAPIService {
  constructor() {
    super("admin")
  }

  async list(data: any = {}) {
    return this.query<APIResponseData<PopupView[]>>(`popup`, {
      params: data,
    })
  }

  async store(data: Popup) {
    return this.post<APIResponseWithMessage>(convertFormData(data), "popup")
  }

  async update(id: number, data: Popup) {
    return this.post<APIResponseWithMessage>(convertFormData(data), `popup/${id}`)
  }

  async destroy(id: number) {
    return this.delete<APIResponseWithMessage>(`popup/${id}`)
  }

  async sortItem(data: any) {
    return this.post<APIResponseWithMessage>(data, `popup/sort`)
  }
}
