import { request } from "@/.cool";

const PRODUCT_PREFIX = '/app/order/product'
const BALANCE_PREFIX = '/app/order/balance'
const ORDER_PREFIX = '/app/order/info'

// ─── 类型定义 ───────────────────────────────────────────────

/** 商品信息 */
export interface ProductInfo {
  id: number
  name: string
  subtitle?: string
  description?: string
  originalPrice: number
  sellPrice: number
  messageQuota: number
  status: number
  sortOrder: number
  coverImage?: string
}

/** 用户余额 */
export interface UserBalance {
  id: number
  userId: number
  balance: number
  messageQuota: number
  totalRecharge: number
  totalConsumed: number
}

/** 订单信息 */
export interface OrderInfo {
  id: number
  userId: number
  orderNo: string
  productId?: number
  productName?: string
  quantity: number
  originalPrice: number
  discountAmount: number
  payAmount: number
  payMethod?: number
  /** 0待支付 1已支付 2已退款 3已关闭 */
  status: number
  payTime?: string
  tradeNo?: string
  clientIp?: string
  createTime: string
}

/** 创建订单请求（购买套餐） */
export interface CreateOrderByProduct {
  productId: number
  quantity?: number
  payMethod?: number
}

/** 创建订单请求（按次发送） */
export interface CreateOrderBySend {
  receiverPhone: string
  content: string
  isAnonymous?: number
  sendType?: number
  scheduledAt?: string
  templateId?: number
  conversationId?: number
  senderSignature?: string
  payMethod?: number
}

/** 微信支付参数（用于 uni.requestPayment） */
export interface WxPayParams {
  orderId: number
  orderNo: string
  payAmount: number
  tradeType?: 'JSAPI' | 'APP' | 'H5'
  orderInfo?: any
  h5Url?: string
  mwebUrl?: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: 'RSA' | 'MD5'
  paySign: string
}

/** 余额支付结果 */
export interface BalancePayResult {
  orderId: number
  orderNo: string
  paid: boolean
}

// ─── 商品接口 ────────────────────────────────────────────────

/** 获取上架商品列表 */
export function getProductList() {
  return request({ url: `${PRODUCT_PREFIX}/list`, method: 'GET' })
}

/** 获取商品详情 */
export function getProductDetail(id: number) {
  return request({ url: `${PRODUCT_PREFIX}/detail`, method: 'GET', data: { id } })
}

// ─── 余额接口 ────────────────────────────────────────────────

/** 获取当前用户余额 */
export function getBalance() {
  return request({ url: `${BALANCE_PREFIX}/info`, method: 'GET' })
}

// ─── 订单接口 ────────────────────────────────────────────────

/**
 * 创建订单（两种模式）
 *  - 传 productId → 购买套餐包（充值 messageQuota）
 *  - 传 receiverPhone + content → 按次计费，支付后自动创建消息记录
 */
export function createOrder(data: CreateOrderByProduct | CreateOrderBySend) {
  return request({ url: `${ORDER_PREFIX}/create`, method: 'POST', data })
}

/**
 * 发起支付
 * @param orderId 订单ID
 * @param payMethod 1微信 2支付宝 3余额
 */
export function payOrder(
  orderId: number,
  payMethod: number,
  params?: { tradeType?: 'JSAPI' | 'APP' | 'H5', code?: string }
) {
  return request({
    url: `${ORDER_PREFIX}/pay`,
    method: 'POST',
    data: { orderId, payMethod, ...params },
  })
}

/** 查询订单支付状态（前端轮询用） */
export function queryOrderStatus(orderId: number) {
  return request({
    url: `${ORDER_PREFIX}/status`,
    method: 'GET',
    data: { orderId },
  })
}

/** 订单详情 */
export function getOrderDetail(id: number) {
  return request({ url: `${ORDER_PREFIX}/detail`, method: 'GET', data: { id } })
}

/** 订单列表 */
export function getOrderList(page = 1, size = 10) {
  return request({
    url: `${ORDER_PREFIX}/orderList`,
    method: 'GET',
    data: { page, size },
  })
}

// ─── 工具函数 ────────────────────────────────────────────────

/**
 * 微信支付完整流程（创建订单 → 发起支付 → 调起微信 → 轮询结果）
 * @param orderData 创建订单参数
 * @returns 支付成功后返回订单信息
 */
export async function wxPayFlow(orderData: CreateOrderByProduct | CreateOrderBySend): Promise<OrderInfo> {
  // 1. 创建订单
  const order = await createOrder(orderData)

  // 2. 发起微信支付，获取支付参数
  const payParams = await payOrder(order.id, 1) as WxPayParams

  // 3. 调起微信支付
  await new Promise<void>((resolve, reject) => {
    uni.requestPayment({
      provider: 'wxpay',
      timeStamp: payParams.timeStamp,
      nonceStr: payParams.nonceStr,
      package: payParams.package,
      signType: payParams.signType,
      paySign: payParams.paySign,
      success: () => resolve(),
      fail: (err) => reject(new Error(err?.errMsg || '支付失败')),
    })
  })

  // 4. 轮询订单状态（最多等 30s）
  return pollOrderStatus(order.id)
}

/**
 * 轮询订单状态直到已支付或超时
 */
async function pollOrderStatus(orderId: number, maxRetry = 10, interval = 3000): Promise<OrderInfo> {
  for (let i = 0; i < maxRetry; i++) {
    await new Promise(r => setTimeout(r, interval))
    const status = await queryOrderStatus(orderId)
    if (status.status === 1) {
      // 已支付，返回完整订单
      return getOrderDetail(orderId)
    }
  }
  throw new Error('支付结果确认超时，请稍后在订单记录中查看')
}
