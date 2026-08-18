import { request, upload } from '@/.cool'

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
 * 上传反馈图片。OSS 对象存储路径：send/app/user/feedback/XXX.png。
 */
export function uploadImage(filePath: string): Promise<string> {
  return upload(filePath, { prefixPath: 'send/app/user/feedback' })
}
