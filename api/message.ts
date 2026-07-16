import { request } from "@/.cool";

const PREFIX = "/app/message/info";

/** 发送消息参数 */
export interface SendMessageParams {
	receiverPhone: string;
	content: string;
	isAnonymous?: number;
	/** 是否公开展示到广场：0 私密，1 公开 */
	isPublic?: number;
	sendType?: number;
	scheduledAt?: string;
	templateId?: number;
	conversationId?: number;
	senderSignature?: string;
}

/** 消息回复 */
export interface MessageReply {
	id: number;
	messageId: number;
	conversationId: number;
	replyContent: string;
	replyPhone: string | null;
	/** 1正常回复 2退订(TD) 3投诉(TS) */
	replyType: number;
	isRead: number;
	receivedAt: string;
	createTime: string;
}

/** 消息记录 */
export interface MessageRecord {
	id: number;
	userId: number;
	conversationId: number | null;
	receiverPhoneMask: string;
	content: string;
	contentLength: number;
	smsCount: number;
	/** 0实名 1匿名 */
	isAnonymous: number;
	/** 是否公开展示到广场：0 私密，1 公开 */
	isPublic: number;
	senderSignature: string | null;
	/** 1立即发送 2定时发送 */
	sendType: number;
	scheduledAt: string | null;
	feeAmount: number;
	/** 1套餐配额 2余额 3在线支付 4模拟支付 */
	payType: number | null;
	/** 0待审核 1审核通过 2审核拒绝 3待发送 4发送中 5已送达 6发送失败 7已取消 */
	status: number;
	deliveredAt: string | null;
	failReason: string | null;
	createTime: string;
	updateTime: string;
	/** 仅详情接口返回 */
	reply?: MessageReply | null;
}

/** 费用计算结果 */
export interface FeeResult {
	feeAmount: number;
}

/** 使用套餐配额发送消息（服务端会同步生成套餐余额订单） */
export function sendMessage(data: SendMessageParams) {
	return request({ url: `${PREFIX}/send`, method: "POST", data });
}

/** 计算消息费用 */
export function calculateFee(content: string) {
	return request({ url: `${PREFIX}/calculateFee`, method: "POST", data: { content } });
}

/** 检查发送频率限制（是否超过每小时10条） */
export function checkSendQuota(receiverPhone: string) {
	return request({ url: `${PREFIX}/checkQuota`, method: "GET", data: { receiverPhone } });
}

/** 发送记录列表 */
export function getRecordList(page = 1, size = 10, status?: number) {
	return request({
		url: `${PREFIX}/recordList`,
		method: "GET",
		data: { page, size, ...(status !== undefined ? { status } : {}) }
	});
}

/** 广场公开消息列表（仅返回已审核通过的公开内容） */
export interface PlazaMessage {
	id: number;
	content: string;
	isAnonymous: number;
	senderSignature: string | null;
	createTime: string;
	replyContent: string | null;
	replyTime: string | null;
}

export function getPublicMessageList(page = 1, size = 10) {
	return request({
		url: `${PREFIX}/publicList`,
		method: 'GET',
		data: { page, size },
	});
}

/** 首页当日最近动态汇总 */
export interface RecentActivity {
	sentCount: number;
	replyCount: number;
	deliveredCount: number;
	date: string;
}

export function getRecentActivity() {
	return request({ url: `${PREFIX}/recentActivity`, method: 'GET' });
}

/** 消息详情 */
export function getMessageDetail(id: number) {
	return request({ url: `${PREFIX}/messageDetail`, method: "GET", data: { id } });
}

/** 取消定时消息 */
export function cancelMessage(id: number) {
	return request({ url: `${PREFIX}/cancel/${id}`, method: "POST" });
}

/** 重新发送失败消息 */
export function resendMessage(id: number) {
	return request({ url: `${PREFIX}/resend/${id}`, method: "POST" });
}

/** Public reply-link APIs; the recipient does not need to be signed in. */
export function getReplyInfo(token: string) {
	return request({ url: "/app/message/reply/info", method: "GET", data: { token } });
}

export function sendReply(data: { token: string; content: string; replyPhone?: string }) {
	return request({ url: "/app/message/reply/send", method: "POST", data });
}
