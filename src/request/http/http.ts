import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios'

export interface BaseResponse<T = any> {
  code: number
  data: T
  msg: string
  [key: string]: any
}

/**
 * http（base/request）域：Axios 的轻量封装。
 * 设计目标：
 * - 统一创建实例、拦截器挂载与错误处理出口
 * - 保持“基础设施”定位：不内置 token/路由跳转等业务逻辑，交由上层注入 interceptors
 */

/**
 * Http 实例构造参数。
 * - interceptors：允许上层注入请求/响应拦截逻辑（例如 token、埋点字段透传、统一错误码处理）
 * - errorHandler：兜底错误处理（例如 toast / 上报）
 */
interface HttpConstructorParams {
  baseURL?: string
  timeout?: number
  withCredentials?: boolean
  errorHandler?: (error: AxiosError) => void
  interceptors?: {
    requestInterceptor?: (
      config: InternalAxiosRequestConfig,
    ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
    requestInterceptorCatch?: (error: AxiosError) => Promise<never>
    responseInterceptor?: (response: AxiosResponse) => any
    responseInterceptorCatch?: (error: AxiosError) => Promise<never>
  }
}

/**
 * request 函数形态的实例（兼容 axios 调用习惯），并挂载 get/post/put/delete 等快捷方法。
 */
interface RequestInstance {
  <T = any>(config: AxiosRequestConfig): Promise<BaseResponse<T>>
  get: <T = any, P = unknown>(url: string, params?: P, config?: AxiosRequestConfig) => Promise<BaseResponse<T>>
  post: <T = any, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => Promise<BaseResponse<T>>
  put: <T = any, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => Promise<BaseResponse<T>>
  delete: <T = any, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => Promise<BaseResponse<T>>
  retry: <T = any>(config: AxiosRequestConfig) => Promise<BaseResponse<T>>
  upload: <T = any>(
    url: string,
    file: File | Blob,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ) => Promise<BaseResponse<T>>
}

/**
 * Axios 实例封装。
 * - request：透传 AxiosRequestConfig
 * - get/post/put/delete：方法化调用
 * - upload：内置 multipart/form-data 上传封装
 */
export class Http {
  private instance: AxiosInstance

  constructor(params?: HttpConstructorParams) {
    this.instance = axios.create({
      baseURL: params?.baseURL,
      timeout: params?.timeout || 30 * 1000,
      withCredentials: params?.withCredentials || false,
    })

    this.instance.interceptors.request.use(
      config => {
        if (params?.interceptors?.requestInterceptor) {
          return params.interceptors.requestInterceptor(config)
        }
        return config
      },
      error => {
        if (params?.interceptors?.requestInterceptorCatch) {
          params.interceptors.requestInterceptorCatch(error)
          return
        }
        return Promise.reject(error)
      },
    )

    this.instance.interceptors.response.use(
      response => {
        if (params?.interceptors?.responseInterceptor) {
          const res = params.interceptors.responseInterceptor(response)
          return res
        }
        return response.data
      },
      (error: AxiosError) => {
        if (params?.errorHandler) {
          params.errorHandler(error)
        }
        if (params?.interceptors?.responseInterceptorCatch) {
          const err = params.interceptors.responseInterceptorCatch(error)
          return err
        }
        return Promise.reject(error)
      },
    )
  }

  /**
   * 发起通用请求（透传 AxiosRequestConfig）。
   */
  public request<T = any>(config: AxiosRequestConfig): Promise<BaseResponse<T>> {
    return this.instance.request(config)
  }

  /**
   * GET 请求快捷方法（params 作为查询参数）。
   */
  public get<T = any, P = unknown>(url: string, params?: P, config?: AxiosRequestConfig): Promise<BaseResponse<T>> {
    return this.instance.request({
      url,
      method: 'GET',
      params,
      ...config,
    })
  }

  /**
   * POST 请求快捷方法（data 作为请求体）。
   */
  public post<T = any, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<BaseResponse<T>> {
    return this.instance.request({
      url,
      method: 'POST',
      data,
      ...config,
    })
  }

  /**
   * PUT 请求快捷方法（data 作为请求体）。
   */
  public put<T = any, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<BaseResponse<T>> {
    return this.instance.request({
      url,
      method: 'PUT',
      data,
      ...config,
    })
  }

  /**
   * DELETE 请求快捷方法（data 作为请求体，保持与当前业务调用方式兼容）。
   */
  public delete<T = any, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<BaseResponse<T>> {
    return this.instance.request({
      url,
      method: 'DELETE',
      data,
      ...config,
    })
  }

  /**
   * 重试请求（当前实现为直接复用 request）。
   * 预留为上层扩展重试策略的切入点。
   */
  public retry<T = any>(config: AxiosRequestConfig): Promise<BaseResponse<T>> {
    return this.request(config)
  }

  /**
   * 文件上传封装（multipart/form-data）。
   * - file：主文件字段固定为 "file"
   * - data：额外字段追加到 FormData
   * - config.headers：允许上层追加自定义 header
   */
  public upload<T = any>(
    url: string,
    file: File | Blob,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ): Promise<BaseResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as any)
      })
    }

    return this.instance.request({
      url,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(config?.headers || {}),
      },
      ...config,
    })
  }
}

/**
 * 创建 RequestInstance：函数式调用 + 方法挂载。
 * 上层通常只需要依赖这个出口，而不直接 new Http。
 */
export const createRequest = (params?: HttpConstructorParams): RequestInstance => {
  const http = new Http(params)
  const request = ((config: AxiosRequestConfig) => http.request(config)) as RequestInstance

  request.get = http.get.bind(http)
  request.post = http.post.bind(http)
  request.put = http.put.bind(http)
  request.delete = http.delete.bind(http)
  request.retry = http.retry.bind(http)
  request.upload = http.upload.bind(http)

  return request
}

/**
 * 创建 AxiosHeaders 实例，并批量写入初始 header。
 * 便于在上层以更明确的方式构建 headers（尤其是需要 set/merge 的场景）。
 */
export const createHeaders = (init?: Record<string, string>) => {
  const headers = new AxiosHeaders()
  if (init) {
    for (const [key, value] of Object.entries(init)) {
      headers.set(key, value)
    }
  }
  return headers
}
