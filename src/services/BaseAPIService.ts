import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"
import axios from "axios"
import type { App } from "vue"
import VueAxios from "vue-axios"

interface CustomAxiosInstance extends AxiosInstance {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
  },
}) as CustomAxiosInstance

apiClient.interceptors.request.use(config => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken")

  if (token) config.headers.Authorization = `Bearer ${token}`
  
  return config
})

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  error => {
    const errorInfo = {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data,
    }

    return Promise.reject(errorInfo)
  },
)

class BaseAPIService {
  protected static staticClient = apiClient

  constructor(protected resource?: string) {
    this.initResource(resource)
  }

  protected initResource(resource?: string): void {
    if (resource) this.resource = resource
  }

  public static init(app: App<Element>): void {
    app.use(VueAxios, axios)
  }

  public static async initCSRF(): Promise<void> {
    await apiClient.get("/sanctum/csrf-cookie")
  }

  protected async query<T>(
    path: string = "",
    params: AxiosRequestConfig = {},
  ): Promise<T> {
    return apiClient.get<T>(this.buildUrl(path), params)
  }

  protected async get<T>(path: string = ""): Promise<T> {
    return apiClient.get<T>(this.buildUrl(path))
  }

  protected async post<T>(data: unknown, path: string = ""): Promise<T> {
    return apiClient.post<T>(this.buildUrl(path), data)
  }

  protected async put<T>(data: unknown, path: string = ""): Promise<T> {
    return apiClient.put<T>(this.buildUrl(path), data)
  }

  protected async delete<T>(path: string = ""): Promise<T> {
    return apiClient.delete<T>(this.buildUrl(path))
  }

  private buildUrl(path: string): string {
    return path ? `${this.resource}/${path}` : this.resource!
  }
}

export default BaseAPIService

export { apiClient }
