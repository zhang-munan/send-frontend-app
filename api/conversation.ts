import { request } from "@/.cool";

const PREFIX = '/app/conversation/info'

/** 对话信息 */
export interface ConversationInfo {
  id: number
  userId: number
  receiverPhoneMask: string
  /** 当前用户在会话中的身份 */
  viewerRole: 'sender' | 'receiver'
  /** 列表和详情标题使用的对端标签 */
  peerLabel: string
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
  smsCount: number | null
  /** 1套餐配额 2余额 3在线支付 4模拟支付 */
  payType: number | null
  status: number
  createTime: string
}

/** 收件人回复会话时允许展示的上下文；匿名发送者的真实手机号不会下发。 */
export interface ConversationReplyContext {
  conversationId: number
  receiverPhoneDisplay: string
  isPeerAnonymous: boolean
}

/** 原发送者在已有会话中继续发送时使用的收件人上下文。 */
export interface ConversationSendContext {
  conversationId: number
  receiverPhone: string
}

/** 获取对话列表 */
export function getConversationList(page = 1, size = 20) {
  return request({
    url: `${PREFIX}/conversationList`,
    method: 'GET',
    data: { page, size },
  })
}

/** 获取对话消息 */
export function getConversationMessages(id: number, page = 1, size = 20) {
  return request({
    url: `${PREFIX}/${id}/messages`,
    method: 'GET',
    data: { page, size },
  })
}

/** 获取回复目标。真实发送者仅在其选择实名发送时展示。 */
export function getConversationReplyContext(id: number) {
  return request({
    url: `${PREFIX}/${id}/reply-context`,
    method: 'GET',
  })
}

/** 获取已有会话的继续发送目标；仅原发送者可调用。 */
export function getConversationSendContext(id: number) {
  return request({
    url: `${PREFIX}/${id}/send-context`,
    method: 'GET',
  })
}

/** 标记对话已读 */
export function markConversationRead(id: number) {
  return request({ url: `${PREFIX}/${id}/read`, method: 'POST' })
}

/** 标记/取消标记对话 */
export function markConversation(id: number, isMarked: number, markType?: string) {
  return request({ url: `${PREFIX}/${id}/mark`, method: 'POST', data: { isMarked, markType } })
}
