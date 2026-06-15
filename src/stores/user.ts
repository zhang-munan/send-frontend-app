import type { LoginToken, UserInfo } from '@/api/user'
import { defineStore } from 'pinia'
import { getPerson, loginByMiniPhone, loginByPhone } from '@/api/user'
import { clearToken, getRefreshToken, getToken, setToken, STORAGE_KEY } from '@/utils/request'

/**
 * 用户登录态 store
 * - 持久化 token / refreshToken / userInfo 到本地存储
 * - 提供手机号验证码登录、小程序一键登录、退出登录等能力
 */
export const useUserStore = defineStore('user', () => {
  // token（与本地存储保持同步）
  const token = ref<string>(getToken())
  const refreshToken = ref<string>(getRefreshToken())
  // 用户信息
  const userInfo = ref<UserInfo | null>(uni.getStorageSync(STORAGE_KEY.USER_INFO) || null)

  /** 是否已登录 */
  const isLogin = computed(() => !!token.value)

  /** 保存 token 信息 */
  function saveToken(data: LoginToken) {
    token.value = data.token
    refreshToken.value = data.refreshToken
    setToken(data.token, data.refreshToken)
  }

  /** 保存用户信息 */
  function setUserInfo(info: UserInfo | null) {
    userInfo.value = info
    if (info)
      uni.setStorageSync(STORAGE_KEY.USER_INFO, info)
    else
      uni.removeStorageSync(STORAGE_KEY.USER_INFO)
  }

  /** 获取并缓存当前用户信息 */
  async function fetchUserInfo() {
    if (!token.value)
      return null
    const info = await getPerson()
    setUserInfo(info)
    return info
  }

  /** 手机号验证码登录（H5 与小程序通用） */
  async function phoneLogin(phone: string, smsCode: string) {
    const data = await loginByPhone(phone, smsCode)
    saveToken(data)
    await fetchUserInfo()
  }

  /** 小程序手机号一键登录 */
  async function miniPhoneLogin(payload: { code: string, encryptedData: string, iv: string }) {
    const data = await loginByMiniPhone(payload)
    saveToken(data)
    await fetchUserInfo()
  }

  /** 退出登录 */
  function logout() {
    token.value = ''
    refreshToken.value = ''
    setUserInfo(null)
    clearToken()
  }

  return {
    token,
    refreshToken,
    userInfo,
    isLogin,
    saveToken,
    setUserInfo,
    fetchUserInfo,
    phoneLogin,
    miniPhoneLogin,
    logout,
  }
})
