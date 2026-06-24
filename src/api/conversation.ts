import { request } from '@/utils/request'

const PREFIX = '/app/conversation/info'

/** 对话信息 */
export interface ConversationInfo {
  id: number
  userId: number
  receiverPhoneMask: string
  lastMsgContent: string
  lastMsgTime: string
  lastMsgIsReply: number
  unreadCount: number
  msgCount: number
  isReceiverUnsubscribed: number
  isMarked: number
  markType: string
  status: number
  createTime: string
  updateTime: string
}

/** 对话时间线消息 */
export interface ConversationMessage {
  id: number
  conversationId: number
  messageId: number | null
  replyId: number | null
  /** 1发出 2收到 */
  direction: number
  contentPreview: string
  feeAmount: number | null
  status: number
  createTime: string
}

/** 获取对话列表 */
export function getConversationList(page = 1, size = 20) {
  return request<{ list: ConversationInfo[], total: number, page: number, size: number }>({
    url: `${PREFIX}/conversationList`,
    method: 'GET',
    data: { page, size },
  })
}

/** 获取对话消息 */
export function getConversationMessages(id: number, page = 1, size = 20) {
  return request<{ list: ConversationMessage[], total: number, page: number, size: number }>({
    url: `${PREFIX}/${id}/messages`,
    method: 'GET',
    data: { page, size },
  })
}

/** 标记对话已读 */
export function markConversationRead(id: number) {
  return request<void>({ url: `${PREFIX}/${id}/read`, method: 'POST' })
}

/** 标记/取消标记对话 */
export function markConversation(id: number, isMarked: number, markType?: string) {
  return request<void>({ url: `${PREFIX}/${id}/mark`, method: 'POST', data: { isMarked, markType } })
}
