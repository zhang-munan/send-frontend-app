/**
 * 网络请求统一封装
 * - 自动拼接基础地址、附带 Authorization 头
 * - 统一处理 cool-admin 返回结构 { code, message, data }
 * - token 失效时自动调用 refreshToken 刷新并重试一次
 */

// cool-admin 接口成功状态码
const SUCCESS_CODE = 1000
// 后端接口基础地址
const BASE_URL = import.meta.env.VITE_APP_BASE_URL || ''
// 登录页路径
const LOGIN_PAGE = '/package-user/login'

/** 本地存储 key */
export const STORAGE_KEY = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER_INFO: 'userInfo',
} as const

/** cool-admin 统一返回结构 */
export interface ApiResult<T = any> {
  code: number
  message: string
  data: T
}

/** 请求参数 */
export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, any>
  header?: Record<string, string>
  /** 是否携带 token，默认 true */
  auth?: boolean
  /** token 失效时是否自动刷新重试，默认 true */
  refresh?: boolean
  /** 是否屏蔽错误 toast 提示，默认 false */
  silent?: boolean
}

/** 读取 token */
export function getToken(): string {
  return uni.getStorageSync(STORAGE_KEY.TOKEN) || ''
}

/** 读取 refreshToken */
export function getRefreshToken(): string {
  return uni.getStorageSync(STORAGE_KEY.REFRESH_TOKEN) || ''
}

/** 写入 token */
export function setToken(token: string, refreshToken?: string): void {
  uni.setStorageSync(STORAGE_KEY.TOKEN, token)
  if (refreshToken !== undefined)
    uni.setStorageSync(STORAGE_KEY.REFRESH_TOKEN, refreshToken)
}

/** 清空登录态相关存储 */
export function clearToken(): void {
  uni.removeStorageSync(STORAGE_KEY.TOKEN)
  uni.removeStorageSync(STORAGE_KEY.REFRESH_TOKEN)
  uni.removeStorageSync(STORAGE_KEY.USER_INFO)
}

/** 基础请求，Promise 化 uni.request，返回完整响应 */
function rawRequest(options: RequestOptions): Promise<UniApp.RequestSuccessCallbackResult> {
  const header: Record<string, string> = { ...(options.header || {}) }
  if (options.auth !== false) {
    const token = getToken()
    if (token)
      header.Authorization = token
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: res => resolve(res),
      fail: err => reject(err),
    })
  })
}

// 刷新 token 的并发锁，避免多个请求同时刷新
let refreshPromise: Promise<string> | null = null
// 跳转登录页的节流标记
let redirecting = false

/** 调用刷新接口获取新 token */
async function doRefresh(): Promise<string> {
  const rt = getRefreshToken()
  if (!rt)
    throw new Error('缺少 refreshToken')
  const res = await rawRequest({
    url: '/app/user/login/refreshToken',
    method: 'POST',
    data: { refreshToken: rt },
    auth: false,
  })
  const body = res.data as ApiResult<{ token: string, refreshToken: string }>
  if (res.statusCode === 200 && body?.code === SUCCESS_CODE) {
    setToken(body.data.token, body.data.refreshToken)
    return body.data.token
  }
  throw new Error('刷新 token 失败')
}

/** 带并发锁的刷新 token */
function refreshToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

/** token 失效处理：清空登录态并跳转登录页 */
function handleAuthExpired(): void {
  clearToken()
  if (redirecting)
    return
  redirecting = true
  uni.showToast({ title: '登录已失效，请重新登录', icon: 'none' })
  setTimeout(() => {
    redirecting = false
    uni.navigateTo({ url: LOGIN_PAGE })
  }, 800)
}

/** 统一请求方法 */
export async function request<T = any>(options: RequestOptions): Promise<T> {
  let res: UniApp.RequestSuccessCallbackResult
  try {
    res = await rawRequest(options)
  }
  catch (err) {
    if (!options.silent)
      uni.showToast({ title: '网络异常，请稍后再试', icon: 'none' })
    throw err
  }

  const body = res.data as ApiResult<T>
  const isAuthFail = res.statusCode === 401 || body?.code === 401

  // token 失效，尝试刷新后重试一次
  if (isAuthFail) {
    if (options.refresh === false || options.auth === false) {
      handleAuthExpired()
      throw new Error(body?.message || '登录失效')
    }
    try {
      await refreshToken()
      return await request<T>({ ...options, refresh: false })
    }
    catch (err) {
      handleAuthExpired()
      throw err
    }
  }

  // 非 200 的网络/服务异常
  if (res.statusCode !== 200) {
    if (!options.silent)
      uni.showToast({ title: '服务异常，请稍后再试', icon: 'none' })
    throw new Error(`HTTP ${res.statusCode}`)
  }

  // 业务成功
  if (body?.code === SUCCESS_CODE)
    return body.data

  // 业务失败
  if (!options.silent)
    uni.showToast({ title: body?.message || '请求失败', icon: 'none' })
  throw new Error(body?.message || '请求失败')
}

/** GET 请求快捷方法 */
export function get<T = any>(url: string, data?: Record<string, any>, options?: Partial<RequestOptions>) {
  return request<T>({ url, method: 'GET', data, ...options })
}

/** POST 请求快捷方法 */
export function post<T = any>(url: string, data?: Record<string, any>, options?: Partial<RequestOptions>) {
  return request<T>({ url, method: 'POST', data, ...options })
}
