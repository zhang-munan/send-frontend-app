<script setup lang="ts">
import { getProductList, getBalance, createOrder, type ProductInfo, type UserBalance } from '@/api/order'

const statusBarHeight = ref(0)
// #ifndef H5
statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0
// #endif

definePage({
  layout: false,
  style: { navigationStyle: 'custom' },
})

// ─── 数据 ─────────────────────────────────────────────
const products = ref<ProductInfo[]>([])
const userBalance = ref<UserBalance | null>(null)
const selectedId = ref<number | null>(null)
const couponCode = ref('')
const couponDiscount = ref(0)
const couponApplied = ref(false)
const couponAppliedCode = ref('')
const loading = ref(true)
const paying = ref(false)

// ─── 计算属性 ──────────────────────────────────────────
const selectedProduct = computed(() =>
  products.value.find(p => p.id === selectedId.value) ?? null,
)

const originalTotal = computed(() => {
  if (!selectedProduct.value) return 0
  return Number(selectedProduct.value.sellPrice)
})

const finalTotal = computed(() =>
  Math.max(0, originalTotal.value - couponDiscount.value),
)

const pricePerSms = (p: ProductInfo) => {
  if (!p.messageQuota) return null
  return (Number(p.sellPrice) / p.messageQuota).toFixed(2)
}

const savedAmount = (p: ProductInfo) => {
  const saved = Number(p.originalPrice) - Number(p.sellPrice)
  return saved > 0 ? saved.toFixed(2) : null
}

// ─── 初始化 ────────────────────────────────────────────
onMounted(async () => {
  try {
    const [list, bal] = await Promise.all([
      getProductList(),
      getBalance().catch(() => null),
    ])
    products.value = list
    userBalance.value = bal
    if (list.length > 0) {
      // 默认选中第一个
      selectedId.value = list[0].id
    }
  }
  finally {
    loading.value = false
  }
})

// ─── 优惠码 ────────────────────────────────────────────
function applyCoupon() {
  if (!couponCode.value.trim()) {
    uni.showToast({ title: '请输入优惠码', icon: 'none' })
    return
  }
  // 模拟优惠码逻辑：SAVE10 立减 1 元
  if (couponCode.value.trim().toUpperCase() === 'SAVE10') {
    couponDiscount.value = 1
    couponApplied.value = true
    couponAppliedCode.value = couponCode.value.trim().toUpperCase()
    uni.showToast({ title: '优惠码已使用', icon: 'success' })
  }
  else {
    uni.showToast({ title: '优惠码无效', icon: 'none' })
  }
}

function removeCoupon() {
  couponDiscount.value = 0
  couponApplied.value = false
  couponAppliedCode.value = ''
  couponCode.value = ''
}

// ─── 购买 ──────────────────────────────────────────────
async function handleBuy() {
  if (!selectedProduct.value) {
    uni.showToast({ title: '请选择套餐', icon: 'none' })
    return
  }
  if (paying.value) return
  paying.value = true
  try {
    const order = await createOrder({ productId: selectedProduct.value.id })
    uni.navigateTo({ url: `/package-order/pay?orderId=${order.id}` })
  }
  catch (err: any) {
    uni.showToast({ title: err?.message || '下单失败，请重试', icon: 'none' })
  }
  finally {
    paying.value = false
  }
}

function goBack() { uni.navigateBack() }
function goOrders() { uni.navigateTo({ url: '/package-order/orders' }) }
</script>

<template>
  <view class="min-h-[100vh] bg-[#fef7f5]">
    <!-- status bar -->
    <!-- #ifndef H5 -->
    <view :style="{ height: `${statusBarHeight}px` }" />
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <view class="h-[22rpx]" />
    <!-- #endif -->

    <!-- nav bar -->
    <view class="relative h-[88rpx] flex items-center px-[20rpx]">
      <view class="h-[72rpx] w-[72rpx] flex items-center" @click="goBack">
        <view class="i-carbon-chevron-left text-[40rpx] text-[#4a2b24]" />
      </view>
      <text class="pointer-events-none absolute left-0 right-0 text-center text-[34rpx] leading-[88rpx] font-[800] text-[#4a2b24]">
        充值中心
      </text>
    </view>

    <!-- 主内容 -->
    <view class="px-[24rpx] pb-[200rpx]">

      <!-- ── 账户余额卡 ── -->
      <view
        class="relative overflow-hidden rounded-[28rpx] px-[32rpx] pt-[36rpx] pb-[40rpx]"
        style="background: linear-gradient(135deg, #ffd2ae 0%, #ff9e8b 50%, #ffcba0 100%); box-shadow: 0 12rpx 36rpx rgba(255,140,100,0.28);"
      >
        <!-- 顶部行 -->
        <view class="flex items-center justify-between">
          <view class="flex items-center gap-[10rpx]">
            <view class="i-carbon-shield text-[30rpx] text-white opacity-90" />
            <text class="text-[26rpx] text-white opacity-90">账户余额</text>
          </view>
          <view class="flex items-center gap-[6rpx]" @click="goOrders">
            <view class="i-carbon-document text-[24rpx] text-white opacity-80" />
            <text class="text-[24rpx] text-white opacity-80">账单明细</text>
            <view class="i-carbon-chevron-right text-[22rpx] text-white opacity-80" />
          </view>
        </view>

        <!-- 余额金额 -->
        <view class="mt-[20rpx] flex items-end gap-[6rpx]">
          <text class="text-[36rpx] font-[700] text-white leading-[56rpx]">¥</text>
          <text class="text-[80rpx] font-[900] text-white leading-[88rpx]">
            {{ userBalance ? Number(userBalance.balance).toFixed(2) : '0.00' }}
          </text>
        </view>

        <!-- 剩余条数徽章 -->
        <view class="mt-[16rpx] inline-flex items-center gap-[8rpx] rounded-[28rpx] bg-[rgba(255,255,255,0.30)] px-[20rpx] py-[8rpx]">
          <text class="text-[26rpx] font-[700] text-white">
            剩余 {{ userBalance?.messageQuota ?? 0 }} 条
          </text>
        </view>

        <!-- 右侧装饰插画 -->
        <view class="absolute right-[24rpx] top-[24rpx] opacity-30 pointer-events-none select-none">
          <text class="text-[120rpx] leading-none">💌</text>
        </view>
      </view>

      <!-- ── 套餐选择 ── -->
      <view class="mt-[28rpx]">
        <view class="mb-[18rpx] flex items-center gap-[10rpx]">
          <text class="text-[28rpx]">🔥</text>
          <text class="text-[30rpx] font-[800] text-[#4a2b24]">选择套餐</text>
        </view>

        <!-- 骨架 -->
        <view v-if="loading" class="flex flex-col gap-[16rpx]">
          <view
            v-for="i in 3"
            :key="i"
            class="h-[120rpx] rounded-[20rpx] bg-[#f5ece9] animate-pulse"
          />
        </view>

        <!-- 套餐列表 -->
        <view v-else class="flex flex-col gap-[16rpx]">
          <view
            v-for="p in products"
            :key="p.id"
            class="relative overflow-hidden rounded-[20rpx] bg-white px-[24rpx] py-[24rpx]"
            :style="selectedId === p.id
              ? 'border: 2rpx solid #fe8973; box-shadow: 0 4rpx 20rpx rgba(254,137,115,0.18);'
              : 'border: 2rpx solid transparent; box-shadow: 0 2rpx 12rpx rgba(89,57,45,0.06);'"
            @click="selectedId = p.id"
          >
            <!-- 角标 -->
            <view
              v-if="p.subtitle && (p.subtitle.includes('最受欢迎') || p.subtitle.includes('最划算'))"
              class="absolute left-[0rpx] top-[0rpx] rounded-br-[12rpx] px-[14rpx] py-[6rpx]"
              :style="p.subtitle.includes('最划算') ? 'background:#ff8c00;' : 'background:#fe8973;'"
            >
              <text class="text-[20rpx] font-[700] text-white">
                {{ p.subtitle.includes('最划算') ? '最划算' : '最受欢迎' }}
              </text>
            </view>

            <view class="flex items-center gap-[20rpx]">
              <!-- 图标 -->
              <view
                class="h-[88rpx] w-[88rpx] flex flex-shrink-0 items-center justify-center rounded-[20rpx]"
                style="background: linear-gradient(135deg, #ffd8c8, #ffb8a8);"
              >
                <text class="text-[46rpx]">🎁</text>
              </view>

              <!-- 名称区域 -->
              <view class="min-w-0 flex-1">
                <text class="block text-[30rpx] font-[800] text-[#4a2b24]">{{ p.name }}</text>
                <text
                  v-if="p.subtitle && !p.subtitle.includes('最受欢迎') && !p.subtitle.includes('最划算')"
                  class="mt-[4rpx] block text-[22rpx] text-[#a08a84]"
                >
                  {{ p.subtitle }}
                </text>
              </view>

              <!-- 条数 -->
              <view class="flex-shrink-0 text-center w-[100rpx]">
                <text
                  class="text-[42rpx] font-[900]"
                  :class="selectedId === p.id ? 'text-[#fe8973]' : 'text-[#4a2b24]'"
                >
                  {{ p.messageQuota }}
                </text>
                <text class="text-[24rpx] text-[#a08a84]"> 条</text>
              </view>

              <!-- 价格区域 -->
              <view class="flex-shrink-0 text-right w-[140rpx]">
                <text class="block text-[34rpx] font-[800] text-[#4a2b24]">
                  ¥{{ Number(p.sellPrice).toFixed(2) }}
                </text>
                <text v-if="pricePerSms(p)" class="block text-[20rpx] text-[#a08a84]">
                  ¥{{ pricePerSms(p) }}/条
                </text>
                <text v-if="savedAmount(p)" class="block text-[20rpx] font-[600] text-[#fe8973]">
                  省¥{{ savedAmount(p) }}
                </text>
                <text v-if="Number(p.originalPrice) > Number(p.sellPrice)" class="block text-[20rpx] text-[#c4b3ae] line-through">
                  ¥{{ Number(p.originalPrice).toFixed(2) }}
                </text>
              </view>

              <!-- 单选圈 -->
              <view class="ml-[4rpx] flex-shrink-0">
                <view
                  v-if="selectedId === p.id"
                  class="h-[44rpx] w-[44rpx] flex items-center justify-center rounded-full bg-[#fe8973]"
                >
                  <view class="i-carbon-checkmark text-[24rpx] text-white" />
                </view>
                <view
                  v-else
                  class="h-[44rpx] w-[44rpx] rounded-full border-[2rpx] border-solid border-[#d8c8c4]"
                />
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- ── 优惠码 ── -->
      <view class="mt-[28rpx]">
        <view class="mb-[16rpx] flex items-center gap-[10rpx]">
          <text class="text-[26rpx]">🏷️</text>
          <text class="text-[28rpx] font-[800] text-[#4a2b24]">优惠码</text>
        </view>

        <view class="flex items-center gap-[16rpx] rounded-[18rpx] bg-white px-[24rpx] py-[16rpx]" style="box-shadow: 0 2rpx 12rpx rgba(89,57,45,0.06);">
          <input
            v-model="couponCode"
            :disabled="couponApplied"
            placeholder="输入优惠码"
            placeholder-style="color: #c4b3ae;"
            class="min-w-0 flex-1 h-[56rpx] text-[28rpx] text-[#4a2b24]"
          />
          <view
            class="h-[64rpx] flex-shrink-0 flex items-center justify-center rounded-[14rpx] px-[28rpx]"
            :class="couponApplied ? 'bg-[#f0f0f0]' : 'bg-[#fe8973]'"
            @click="!couponApplied && applyCoupon()"
          >
            <text class="text-[26rpx] font-[700]" :class="couponApplied ? 'text-[#b0b0b0]' : 'text-white'">
              使用
            </text>
          </view>
        </view>

        <!-- 已使用优惠码提示 -->
        <view
          v-if="couponApplied"
          class="mt-[14rpx] flex items-center gap-[12rpx] rounded-[14rpx] bg-[#f0fff4] px-[20rpx] py-[14rpx]"
          style="border: 1rpx solid #b7ebc3;"
        >
          <view class="i-carbon-checkmark-filled flex-shrink-0 text-[30rpx] text-[#4caf50]" />
          <text class="min-w-0 flex-1 text-[24rpx] text-[#2e7d32]">
            已使用优惠码 {{ couponAppliedCode }}，立减 ¥{{ couponDiscount.toFixed(2) }}
          </text>
          <view class="i-carbon-close flex-shrink-0 text-[26rpx] text-[#a0a0a0]" @click="removeCoupon" />
        </view>
      </view>

    </view>

    <!-- ── 底部购买栏 ── -->
    <view
      class="fixed bottom-0 left-0 right-0 border-t border-t-solid border-t-[#f0e8e4] bg-white px-[24rpx] pb-[48rpx] pt-[20rpx]"
    >
      <view class="flex items-center gap-[24rpx]">
        <!-- 左侧：合计 + 优惠信息 -->
        <view class="flex flex-shrink-0 flex-col justify-center">
          <view class="flex items-baseline gap-[4rpx]">
            <text class="text-[26rpx] text-[#7a5147]">合计：</text>
            <text class="text-[26rpx] font-[700] text-[#fe8973]">¥</text>
            <text class="text-[48rpx] font-[900] leading-[52rpx] text-[#fe8973]">
              {{ finalTotal.toFixed(2) }}
            </text>
          </view>
          <view v-if="couponApplied" class="mt-[4rpx] flex items-center gap-[6rpx]">
            <text class="text-[22rpx] text-[#a08a84]">已优惠</text>
            <text class="text-[22rpx] font-[600] text-[#fe8973]">¥{{ couponDiscount.toFixed(2) }}</text>
            <text class="text-[22rpx] text-[#c4b3ae]">，明细</text>
            <view class="i-carbon-chevron-down text-[20rpx] text-[#a08a84]" />
          </view>
        </view>

        <!-- 购买按钮 -->
        <view
          class="h-[88rpx] flex-1 flex items-center justify-center rounded-[22rpx]"
          :class="paying || !selectedProduct ? 'bg-[#fbb9ad]' : 'bg-[#fe8973]'"
          style="box-shadow: 0 8rpx 24rpx rgba(254,137,115,0.36);"
          @click="handleBuy"
        >
          <text class="text-[32rpx] font-[800] text-white">
            {{ paying ? '处理中...' : '立即购买' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
