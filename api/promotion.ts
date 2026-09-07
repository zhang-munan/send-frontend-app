import { request } from '@/.cool'

const PREFIX = '/app/promotion/ambassador'

export interface PromotionConfig {
  enabled: number
  referralRewardQuota: number
  commissionRateBps: number
  settlementDays: number
  bindWindowHours: number
  minWithdrawAmount: number
  maxWithdrawAmount: number
  withdrawFeeRateBps: number
}

export interface AmbassadorAccount {
  id: number
  promotionCode: string
  status: number
  availableBalance: number
  frozenBalance: number
  totalCommission: number
  totalWithdrawn: number
  totalReferrals: number
}

export interface PromotionOverview {
  isAmbassador: boolean
  ambassador?: AmbassadorAccount
  pendingBalance?: number
  config: PromotionConfig
}

export function getPromotionOverview(): Promise<PromotionOverview> {
  return request({ url: `${PREFIX}/overview`, method: 'GET' })
}

export function applyAmbassador() {
  return request({ url: `${PREFIX}/apply`, method: 'POST', data: { agreed: true } })
}

export function getCommissionList(page = 1, size = 20) {
  return request({ url: `${PREFIX}/commissions`, method: 'GET', data: { page, size } })
}

export function getReferralList(page = 1, size = 20) {
  return request({ url: `${PREFIX}/referrals`, method: 'GET', data: { page, size } })
}

export function getWithdrawalList(page = 1, size = 20) {
  return request({ url: `${PREFIX}/withdrawals`, method: 'GET', data: { page, size } })
}

export function applyWithdrawal(data: {
  amount: number
  withdrawMethod: number
  accountName: string
  accountNo: string
  bankName?: string
}) {
  return request({ url: `${PREFIX}/withdraw`, method: 'POST', data })
}

export function cancelWithdrawal(id: number) {
  return request({ url: `${PREFIX}/cancelWithdrawal`, method: 'POST', data: { id } })
}
