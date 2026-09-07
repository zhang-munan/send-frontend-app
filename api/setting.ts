import { request } from "@/.cool";

const USER_SETTING_PREFIX = '/app/setting/userSetting'
const DOC_PREFIX = '/app/setting/doc'
const PUBLIC_PARAM_PREFIX = '/app/base/comm/param'

/** 用户设置 */
export interface UserSetting {
  id?: number
  userId?: number
  notifySendResult: number
  notifyReply: number
  notifyActivity: number
  defaultAnonymous: number
  blockAllSms: number
}

/** 协议文档 */
export interface SettingDoc {
  id: number
  docKey: string
  title: string
  content: string
}

/** 获取用户设置 */
export function getUserSetting() {
  return request({
    url: `${USER_SETTING_PREFIX}/info`,
    method: 'GET',
  })
}

/** 更新用户设置 */
export function updateUserSetting(data: Partial<UserSetting>) {
  return request({
    url: `${USER_SETTING_PREFIX}/saveSetting`,
    method: 'POST',
    data,
  })
}

/** 获取允许下发到手机端的后台参数 */
export function getPublicParam(key: string) {
  return request({
    url: PUBLIC_PARAM_PREFIX,
    method: 'GET',
    data: { key },
  })
}

/** 获取协议文档（含推广大使规则等后台配置文档） */
export function getDoc(key: string) {
  return request({
    url: `${DOC_PREFIX}/get`,
    method: 'GET',
    data: { key },
    header: {
      Authorization: null,
    },
  })
}
