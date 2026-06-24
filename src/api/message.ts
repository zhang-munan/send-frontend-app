import { request } from '@/utils/request'

const PREFIX = '/app/message/info'

/** 发送消息参数 */
export interface SendMessageParams {
  receiverPhone: string
  content: string
  isAnonymous?: number
  sendType?: number
  scheduledAt?: string
  templateId?: number
  conversationId?: number
  senderSignature?: string
}

/** 消息回复 */
export interface MessageReply {
  id: number
  messageId: number
  conversationId: number
  replyContent: string
  replyPhone: string | null
  /** 1正常回复 2退订(TD) 3投诉(TS) */
  replyType: number
  isRead: number
  receivedAt: string
  createTime: string
}

/** 消息记录 */
export interface MessageRecord {
  id: number
  userId: number
  conversationId: number | null
  receiverPhoneMask: string
  content: string
  contentLength: number
  smsCount: number
  /** 0实名 1匿名 */
  isAnonymous: number
  senderSignature: string | null
  /** 1立即发送 2定时发送 */
  sendType: number
  scheduledAt: string | null
  feeAmount: number
  /** 0待审核 1审核通过 2审核拒绝 3待发送 4发送中 5已送达 6发送失败 7已取消 */
  status: number
  deliveredAt: string | null
  failReason: string | null
  createTime: string
  updateTime: string
  /** 仅详情接口返回 */
  reply?: MessageReply | null
}

/** 费用计算结果 */
export interface FeeResult {
  feeAmount: number
}

/** 使用配额直接发送消息 */
export function sendMessage(data: SendMessageParams) {
  return request<MessageRecord>({ url: `${PREFIX}/send`, method: 'POST', data })
}

/** 计算消息费用 */
export function calculateFee(content: string) {
  return request<FeeResult>({ url: `${PREFIX}/calculateFee`, method: 'POST', data: { content } })
}

/** 检查发送频率限制（是否超过每小时10条） */
export function checkSendQuota(receiverPhone: string) {
  return request<boolean>({ url: `${PREFIX}/checkQuota`, method: 'GET', data: { receiverPhone } })
}

/** 发送记录列表 */
export function getRecordList(page = 1, size = 10, status?: number) {
  return request<{ list: MessageRecord[], total: number, page: number, size: number }>({
    url: `${PREFIX}/recordList`,
    method: 'GET',
    data: { page, size, ...(status !== undefined ? { status } : {}) },
  })
}

/** 消息详情 */
export function getMessageDetail(id: number) {
  return request<MessageRecord>({ url: `${PREFIX}/messageDetail`, method: 'GET', data: { id } })
}

/** 取消定时消息 */
export function cancelMessage(id: number) {
  return request<MessageRecord>({ url: `${PREFIX}/cancel/${id}`, method: 'POST' })
}

/** 重新发送失败消息 */
export function resendMessage(id: number) {
  return request<MessageRecord>({ url: `${PREFIX}/resend/${id}`, method: 'POST' })
}
