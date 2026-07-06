import { request, useStore } from '@/.cool'
import { config } from '@/config'

const PREFIX = '/app/feedback/info'

/** 反馈类型 */
export const FEEDBACK_TYPES = [
  { label: '功能建议', value: 0 },
  { label: '问题反馈', value: 1 },
  { label: '投诉举报', value: 2 },
  { label: '其他', value: 3 },
]

/** 反馈状态 */
export const FEEDBACK_STATUS = [
  { label: '待处理', value: 0 },
  { label: '已回复', value: 1 },
  { label: '已关闭', value: 2 },
]

/** 反馈信息 */
export interface FeedbackInfo {
  id: number
  userId: number
  type: number
  content: string
  images: string[]
  contact: string
  status: number
  reply: string
  replyTime: string
  createTime: string
  updateTime: string
}

/** 提交反馈 */
export function submitFeedback(data: {
  type: number
  content: string
  images?: string[]
  contact?: string
}) {
  return request<null>({
    url: `${PREFIX}/submit`,
    method: 'POST',
    data,
  })
}

/** 我的反馈列表 */
export function getMyFeedbackList() {
  return request<FeedbackInfo[]>({
    url: `${PREFIX}/myList`,
    method: 'GET',
  })
}

/**
 * 上传图片到后端（复用 /app/base/comm/upload 接口）
 * uni-app 小程序端只能用 uni.uploadFile，无法复用 request
 */
export function uploadImage(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const { user } = useStore()
    const token = user.token || ''
    uni.uploadFile({
      url: `${config.baseUrl}/app/base/comm/upload`,
      filePath,
      name: 'file',
      header: token ? { Authorization: token } : {},
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data?.code === 1000 && data?.data?.url) {
            resolve(data.data.url)
          }
          else {
            reject(new Error(data?.message || '上传失败'))
          }
        }
        catch {
          reject(new Error('上传响应解析失败'))
        }
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}
