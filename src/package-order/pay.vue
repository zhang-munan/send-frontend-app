<script setup lang="ts">
import type { OrderInfo, WxPayParams } from '@/api/order'
import { getBalance, getOrderDetail, payOrder, queryOrderStatus } from '@/api/order'

const statusBarHeight = ref(0)
// #ifndef H5
statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0
// #endif

definePage({
  layout: false,
  style: {
    navigationStyle: 'custom',
  },
})

// ─── 路由参数 ────────────────────────────────────────────────
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1] as any
const orderId = computed<number>(() => Number(currentPage?.options?.orderId || 0))

// ─── 状态 ────────────────────────────────────────────────────
const selectedPayment = ref<'wechat' | 'alipay' | 'balance'>('wechat')
const orderInfo = ref<OrderInfo | null>(null)
const userBalance = ref(0)
const userQuota = ref(0)
const loading = ref(true)
const paying = ref(false)

// ─── 支付方式列表 ─────────────────────────────────────────────
const paymentMethods = computed(() => [
  {
    id: 'wechat' as const,
    name: '微信支付',
    tag: '',
    disabled: false,
    iconBg: '#07c160',
    iconText: '微',
  },
  {
    id: 'alipay' as const,
    name: '支付宝支付',
    tag: 'H5端支持',
    disabled: false,
    iconBg: '#1677ff',
    iconText: '支',
  },
  {
    id: 'balance' as const,
    name: `余额支付（¥${userBalance.value.toFixed(2)}）`,
    tag: '',
    disabled: userBalance.value < (orderInfo.value ? Number(orderInfo.value.payAmount) : Infinity),
    disabledTip: '余额不足，暂不可用',
    iconBg: userBalance.value >= (orderInfo.value ? Number(orderInfo.value.payAmount) : 0) ? '#a28fdb' : '#d0d0d0',
    iconText: '余',
  },
])

// ─── 初始化 ──────────────────────────────────────────────────
onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    const [order, balance] = await Promise.all([
      getOrderDetail(orderId.value),
      getBalance().catch(() => null),
    ])
    orderInfo.value = order
    if (balance) {
      userBalance.value = Number(balance.balance)
      userQuota.value = balance.messageQuota
    }
  }
  catch (err: any) {
    uni.showToast({ title: err?.message || '加载订单失败', icon: 'none' })
  }
  finally {
    loading.value = false
  }
}

// ─── 支付逻辑 ─────────────────────────────────────────────────
const PAY_METHOD_MAP = { wechat: 1, alipay: 2, balance: 3 }

async function handlePay() {
  if (!orderInfo.value)
    return
  if (paying.value)
    return

  paying.value = true
  uni.showLoading({ title: '处理中...', mask: true })

  try {
    const payMethodNum = PAY_METHOD_MAP[selectedPayment.value]
    const result = await payOrder(orderInfo.value.id, payMethodNum)

    if (selectedPayment.value === 'wechat') {
      // 微信支付：调起收银台
      await invokeWxPay(result as WxPayParams)
      // 轮询等待后端确认
      await waitForPaid(orderInfo.value.id)
    }
    else if (selectedPayment.value === 'balance') {
      // 余额支付：同步完成
      await onPaySuccess()
    }
  }
  catch (err: any) {
    uni.hideLoading()
    uni.showToast({ title: err?.message || '支付失败，请重试', icon: 'none' })
  }
  finally {
    paying.value = false
  }
}

/** 调起微信支付 */
function invokeWxPay(params: WxPayParams): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: 'wxpay',
      timeStamp: params.timeStamp,
      nonceStr: params.nonceStr,
      package: params.package,
      signType: params.signType,
      paySign: params.paySign,
      success: () => resolve(),
      fail: (err) => {
        // 用户主动取消不算错误
        if (err?.errMsg?.includes('cancel')) {
          reject(new Error('已取消支付'))
        }
        else {
          reject(new Error(err?.errMsg || '微信支付失败'))
        }
      },
    })
  })
}

/** 轮询直到后端确认已支付（最多等30秒） */
async function waitForPaid(oId: number, maxRetry = 10, interval = 3000) {
  for (let i = 0; i < maxRetry; i++) {
    await new Promise(r => setTimeout(r, interval))
    const status = await queryOrderStatus(oId).catch(() => null)
    if (status?.status === 1) {
      await onPaySuccess()
      return
    }
  }
  uni.hideLoading()
  uni.showToast({ title: '支付结果确认中，请稍后在订单记录查看', icon: 'none' })
}

/** 支付成功后跳转 */
async function onPaySuccess() {
  uni.hideLoading()
  uni.showToast({ title: '支付成功！', icon: 'success' })
  setTimeout(() => {
    // 回到首页并刷新
    uni.switchTab({ url: '/pages/index' })
  }, 1500)
}

function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <view class="min-h-[100vh] bg-[#fef7f5] text-[#4a2b24]">
    <!-- Status bar -->
    <!-- #ifndef H5 -->
    <view :style="{ height: `${statusBarHeight}px` }" />
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <view class="h-[22rpx]" />
    <!-- #endif -->

    <!-- Nav bar -->
    <view class="relative h-[88rpx] flex items-center px-[20rpx]">
      <view class="h-[72rpx] w-[72rpx] flex items-center" @click="goBack">
        <view class="i-carbon-chevron-left text-[40rpx] text-[#4a2b24]" />
      </view>
      <text class="pointer-events-none absolute left-0 right-0 text-center text-[34rpx] leading-[88rpx] font-[800] text-[#4a2b24]">
        确认支付
      </text>
    </view>

    <!-- Loading skeleton -->
    <view v-if="loading" class="flex flex-col items-center justify-center py-[120rpx]">
      <view class="i-carbon-progress-bar text-[60rpx] text-[#fe8973] animate-spin" />
      <text class="mt-[20rpx] text-[26rpx] text-[#a08a84]">加载中...</text>
    </view>

    <!-- 订单内容 -->
    <view v-else-if="orderInfo" class="px-[24rpx] pb-[200rpx]">

      <!-- Product info card -->
      <view class="rounded-[22rpx] bg-white px-[24rpx] py-[24rpx]" style="box-shadow: 0 4rpx 20rpx rgba(254,137,115,0.08);">
        <view class="flex items-center gap-[20rpx]">
          <view
            class="h-[120rpx] w-[120rpx] flex flex-shrink-0 items-center justify-center rounded-[20rpx]"
            style="background: linear-gradient(135deg, #ffd8c8, #ffb8a8);"
          >
            <text class="text-[60rpx]">🎁</text>
          </view>
          <view class="min-w-0 flex-1">
            <view class="flex items-baseline gap-[10rpx]">
              <text class="text-[30rpx] font-[800] text-[#4a2b24]">{{ orderInfo.productName }}</text>
            </view>
            <text class="mt-[10rpx] block text-[24rpx] text-[#a08a84]">数量：{{ orderInfo.quantity }}</text>
            <text class="mt-[6rpx] block text-[22rpx] text-[#a08a84]">订单编号：{{ orderInfo.orderNo }}</text>
            <text class="mt-[6rpx] block text-[22rpx] text-[#a08a84]">创建时间：{{ orderInfo.createTime }}</text>
          </view>
        </view>
      </view>

      <!-- Price breakdown card -->
      <view class="mt-[16rpx] rounded-[22rpx] bg-white px-[28rpx] py-[24rpx]" style="box-shadow: 0 4rpx 20rpx rgba(254,137,115,0.08);">
        <view class="flex items-center justify-between py-[8rpx]">
          <text class="text-[28rpx] text-[#4a2b24]">商品金额：</text>
          <text class="text-[28rpx] text-[#4a2b24]">¥{{ Number(orderInfo.originalPrice).toFixed(2) }}</text>
        </view>
        <view v-if="Number(orderInfo.discountAmount) > 0" class="flex items-center justify-between py-[8rpx]">
          <view class="flex items-center gap-[12rpx]">
            <text class="text-[28rpx] text-[#4a2b24]">优惠折扣：</text>
            <view class="rounded-[8rpx] bg-[#fff0ea] px-[12rpx] py-[4rpx]">
              <text class="text-[20rpx] font-[600] text-[#fe8973]">-¥{{ Number(orderInfo.discountAmount).toFixed(2) }}</text>
            </view>
          </view>
          <text class="text-[28rpx] font-[600] text-[#fe8973]">-¥{{ Number(orderInfo.discountAmount).toFixed(2) }}</text>
        </view>
        <view class="my-[16rpx] h-[1rpx] bg-[#f5ece9]" />
        <view class="flex items-center justify-between py-[4rpx]">
          <text class="text-[28rpx] font-[700] text-[#4a2b24]">应付金额：</text>
          <text class="text-[48rpx] font-[800] leading-[60rpx] text-[#fe8973]">¥{{ Number(orderInfo.payAmount).toFixed(2) }}</text>
        </view>
      </view>

      <!-- Payment method section -->
      <view class="mt-[16rpx] rounded-[22rpx] bg-white px-[28rpx] pt-[20rpx] pb-[8rpx]" style="box-shadow: 0 4rpx 20rpx rgba(254,137,115,0.08);">
        <text class="mb-[16rpx] block text-[28rpx] font-[700] text-[#4a2b24]">支付方式</text>

        <view
          v-for="method in paymentMethods"
          :key="method.id"
          class="mb-[12rpx] flex items-center gap-[16rpx] rounded-[16rpx] px-[16rpx] py-[18rpx]"
          :class="[
            method.disabled
              ? 'bg-[#f8f8f8]'
              : selectedPayment === method.id
                ? 'border border-solid border-[#febaaa] bg-[#fff5f4]'
                : 'border border-solid border-transparent bg-[#fafafa]',
          ]"
          @click="!method.disabled && (selectedPayment = method.id)"
        >
          <view
            class="h-[56rpx] w-[56rpx] flex flex-shrink-0 items-center justify-center rounded-[14rpx]"
            :style="{ backgroundColor: method.iconBg }"
          >
            <text class="text-[28rpx] font-[800] text-white">{{ method.iconText }}</text>
          </view>

          <view class="min-w-0 flex-1">
            <view class="flex items-center gap-[12rpx]">
              <text
                class="text-[28rpx] font-[600]"
                :class="method.disabled ? 'text-[#b0b0b0]' : 'text-[#4a2b24]'"
              >
                {{ method.name }}
              </text>
              <view v-if="method.tag" class="rounded-[8rpx] bg-[#dbeafe] px-[10rpx] py-[3rpx]">
                <text class="text-[18rpx] font-[600] text-[#3b82f6]">{{ method.tag }}</text>
              </view>
            </view>
            <text v-if="method.disabled && 'disabledTip' in method" class="mt-[4rpx] block text-[22rpx] text-[#b0b0b0]">
              {{ (method as any).disabledTip }}
            </text>
          </view>

          <view class="flex-shrink-0">
            <view
              v-if="!method.disabled && selectedPayment === method.id"
              class="h-[40rpx] w-[40rpx] flex items-center justify-center rounded-full bg-[#fe8973]"
            >
              <view class="i-carbon-checkmark text-[22rpx] text-white" />
            </view>
            <view
              v-else-if="!method.disabled"
              class="h-[40rpx] w-[40rpx] rounded-full border-[2rpx] border-solid border-[#d8c8c4]"
            />
            <view
              v-else
              class="h-[40rpx] w-[40rpx] flex items-center justify-center rounded-full bg-[#f0f0f0]"
            >
              <view class="h-[3rpx] w-[22rpx] bg-[#c8c8c8]" />
            </view>
          </view>
        </view>
      </view>

      <!-- Warm tip card -->
      <view class="relative mt-[16rpx] overflow-hidden rounded-[22rpx] px-[24rpx] py-[20rpx]" style="background: linear-gradient(135deg, #fff8f5, #fff3ee);">
        <view class="absolute right-[0rpx] top-[0rpx] opacity-20">
          <text class="text-[80rpx]">💕</text>
        </view>
        <view class="flex items-start gap-[14rpx]">
          <view class="i-carbon-shield mt-[2rpx] flex-shrink-0 text-[34rpx] text-[#fe8973]" />
          <text class="flex-1 text-[24rpx] text-[#6a3b29] leading-[38rpx]">
            温馨提示：支付成功后，消息将进入审核队列，审核通过后自动送达。
          </text>
        </view>
      </view>
    </view>

    <!-- 加载失败 -->
    <view v-else class="flex flex-col items-center justify-center py-[120rpx]">
      <text class="text-[28rpx] text-[#a08a84]">订单加载失败</text>
      <view class="mt-[30rpx] rounded-[16rpx] bg-[#fe8973] px-[40rpx] py-[18rpx]" @click="loadData">
        <text class="text-[26rpx] font-[600] text-white">重新加载</text>
      </view>
    </view>

    <!-- Fixed bottom action bar -->
    <view
      v-if="orderInfo"
      class="fixed bottom-0 left-0 right-0 border-t border-t-solid border-t-[#f0e8e4] bg-white px-[24rpx] pb-[48rpx] pt-[20rpx]"
    >
      <view class="flex items-center gap-[24rpx]">
        <view class="flex flex-shrink-0 flex-col">
          <text class="text-[22rpx] text-[#7a5147]">应付金额</text>
          <text class="text-[40rpx] font-[800] leading-[48rpx] text-[#fe8973]">
            ¥{{ Number(orderInfo.payAmount).toFixed(2) }}
          </text>
        </view>
        <view
          class="h-[88rpx] flex-1 flex items-center justify-center rounded-[22rpx]"
          :class="paying ? 'bg-[#fbb9ad]' : 'bg-[#fe8973]'"
          style="box-shadow: 0 8rpx 24rpx rgba(254,137,115,0.36);"
          @click="handlePay"
        >
          <text class="text-[32rpx] font-[800] text-white">
            {{ paying ? '支付处理中...' : '确认支付' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
