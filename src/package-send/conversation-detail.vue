<script setup lang="ts">
import { getConversationMessages, markConversationRead, type ConversationMessage } from '@/api/conversation'

const statusBarHeight = ref(0)
// #ifndef H5
statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0
// #endif

definePage({
  layout: false,
  style: { navigationStyle: 'custom' },
})

// ─── 路由参数 ────────────────────────────────────────
const convId = ref(0)
const phoneLabel = ref('')

onLoad((options) => {
  convId.value = Number(options?.id || 0)
  phoneLabel.value = decodeURIComponent(options?.phone || '')
  if (convId.value) {
    loadMessages(true)
    markConversationRead(convId.value).catch(() => {})
  }
})

// ─── 消息列表 ────────────────────────────────────────
const messages = ref<ConversationMessage[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const noMore = ref(false)

// 消息按时间正序显示
const sortedMessages = computed(() =>
  [...messages.value].sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime()),
)

async function loadMessages(reset = false) {
  if (loading.value) return
  if (!reset && noMore.value) return
  if (reset) {
    page.value = 1
    noMore.value = false
    messages.value = []
  }
  loading.value = true
  try {
    const res = await getConversationMessages(convId.value, page.value, pageSize)
    messages.value.push(...res.list)
    total.value = res.total
    if (messages.value.length >= res.total) noMore.value = true
    page.value++
  }
  catch (err: any) {
    uni.showToast({ title: err?.message || '加载失败', icon: 'none' })
  }
  finally {
    loading.value = false
  }
}

// ─── 提示横幅 ────────────────────────────────────────
const showBanner = ref(true)

// ─── 菜单 ────────────────────────────────────────────
function showMenu() {
  uni.showActionSheet({
    itemList: ['发送记录', '举报'],
    success: (res) => {
      if (res.tapIndex === 0) uni.navigateTo({ url: '/package-send/send-records' })
    },
  })
}

// ─── 格式化 ────────────────────────────────────────────
function formatTime(t: string) {
  if (!t) return ''
  const d = new Date(t.replace('T', ' '))
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  if (msgDate.getTime() === today.getTime()) return hm
  if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}-${d.getDate()} ${hm}`
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${hm}`
}

// 相邻消息是否需要显示时间戳（间隔>5分钟）
function shouldShowTime(idx: number): boolean {
  if (idx === 0) return true
  const cur = new Date(sortedMessages.value[idx].createTime.replace('T', ' ')).getTime()
  const prev = new Date(sortedMessages.value[idx - 1].createTime.replace('T', ' ')).getTime()
  return cur - prev > 5 * 60 * 1000
}

// ─── 跳转发送 ────────────────────────────────────────
function goSend() {
  uni.navigateTo({ url: '/package-send/send' })
}

function goBack() { uni.navigateBack() }
</script>

<template>
  <view class="flex min-h-[100vh] flex-col bg-[#f2f2f7]">
    <!-- status bar -->
    <!-- #ifndef H5 -->
    <view :style="{ height: `${statusBarHeight}px` }" class="bg-white" />
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <view class="h-[22rpx] bg-white" />
    <!-- #endif -->

    <!-- nav bar -->
    <view class="flex h-[88rpx] flex-shrink-0 items-center justify-between bg-white px-[20rpx]" style="border-bottom:1rpx solid #f5f5f5">
      <view class="h-[72rpx] w-[72rpx] flex items-center" @click="goBack">
        <view class="i-carbon-chevron-left text-[40rpx] text-[#4a2b24]" />
      </view>
      <text class="text-[32rpx] font-[800] text-[#1a1a1a]">{{ phoneLabel }}</text>
      <view class="h-[72rpx] w-[72rpx] flex items-center justify-center" @click="showMenu">
        <view class="i-carbon-overflow-menu-horizontal text-[36rpx] text-[#a08a84]" />
      </view>
    </view>

    <!-- 安全提示横幅 -->
    <view
      v-if="showBanner"
      class="flex flex-shrink-0 items-center gap-[12rpx] px-[24rpx] py-[16rpx]"
      style="background:#fffbef; border-bottom:1rpx solid #f5e9c0;"
    >
      <view class="i-carbon-shield-check flex-shrink-0 text-[30rpx] text-[#e6a817]" />
      <text class="flex-1 text-[24rpx] leading-[38rpx] text-[#7a6010]">
        保持真诚和尊重，好的沟通是双向的 💛
      </text>
      <view class="h-[40rpx] w-[40rpx] flex flex-shrink-0 items-center justify-center" @click="showBanner = false">
        <view class="i-carbon-close text-[24rpx] text-[#a0a0a0]" />
      </view>
    </view>

    <!-- 消息区域 -->
    <scroll-view
      scroll-y
      scroll-into-view="msg-bottom"
      class="flex-1 px-[20rpx] pb-[20rpx]"
    >
      <!-- 加载更多 -->
      <view v-if="!noMore" class="py-[20rpx] text-center" @click="loadMessages(false)">
        <text class="text-[24rpx] text-[#a08a84]">{{ loading ? '加载中...' : '加载更早消息' }}</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && sortedMessages.length === 0" class="flex flex-col items-center justify-center py-[80rpx]">
        <text class="text-[60rpx]">💌</text>
        <text class="mt-[16rpx] text-[26rpx] text-[#a08a84]">暂无消息记录</text>
      </view>

      <!-- 消息气泡 -->
      <view v-for="(msg, idx) in sortedMessages" :key="msg.id">
        <!-- 时间戳 -->
        <view v-if="shouldShowTime(idx)" class="py-[20rpx] text-center">
          <text class="rounded-[12rpx] bg-[rgba(0,0,0,0.08)] px-[16rpx] py-[6rpx] text-[22rpx] text-[#888]">
            {{ formatTime(msg.createTime) }}
          </text>
        </view>

        <!-- 发出（右侧粉色气泡）-->
        <view v-if="msg.direction === 1" class="mb-[16rpx] flex justify-end gap-[16rpx]">
          <view class="max-w-[72%]">
            <view
              class="rounded-[24rpx] rounded-tr-[8rpx] px-[28rpx] py-[20rpx]"
              style="background:linear-gradient(135deg,#fe8973,#fe6a5a)"
            >
              <text class="text-[30rpx] leading-[50rpx] text-white">{{ msg.contentPreview }}</text>
            </view>
            <view class="mt-[8rpx] flex items-center justify-end gap-[12rpx]">
              <text v-if="msg.feeAmount" class="text-[20rpx] text-[#a08a84]">¥{{ Number(msg.feeAmount).toFixed(2) }}</text>
              <view class="i-carbon-checkmark-outline text-[22rpx] text-[#a0a0a0]" />
            </view>
          </view>
        </view>

        <!-- 收到（左侧白色气泡）-->
        <view v-else-if="msg.direction === 2" class="mb-[16rpx] flex items-start gap-[16rpx]">
          <!-- 对方头像 -->
          <view
            class="h-[72rpx] w-[72rpx] flex flex-shrink-0 items-center justify-center rounded-full"
            style="background:#e0e0e0"
          >
            <view class="i-carbon-user-avatar text-[36rpx] text-[#888]" />
          </view>
          <view class="max-w-[72%]">
            <text class="mb-[6rpx] block text-[22rpx] text-[#a08a84]">对方回复</text>
            <view
              class="rounded-[24rpx] rounded-tl-[8rpx] bg-white px-[28rpx] py-[20rpx]"
              style="box-shadow:0 2rpx 8rpx rgba(0,0,0,0.06)"
            >
              <text class="text-[30rpx] leading-[50rpx] text-[#1a1a1a]">{{ msg.contentPreview }}</text>
            </view>
            <text class="mt-[8rpx] block text-[20rpx] text-[#a08a84]">{{ formatTime(msg.createTime) }}</text>
          </view>
        </view>
      </view>

      <view id="msg-bottom" class="h-[1rpx]" />
    </scroll-view>

    <!-- 底部操作栏 -->
    <view
      class="flex-shrink-0 bg-white px-[24rpx] pb-[40rpx] pt-[20rpx]"
      style="border-top:1rpx solid #f5f5f5; box-shadow:0 -4rpx 20rpx rgba(0,0,0,0.04);"
    >
      <view class="flex items-center gap-[16rpx]">
        <text class="flex-1 truncate text-[26rpx] text-[#a08a84]">你可以发送新消息给对方</text>
        <view
          class="flex flex-shrink-0 items-center gap-[8rpx] rounded-[28rpx] px-[32rpx] py-[18rpx]"
          style="background:linear-gradient(135deg,#fe8973,#fe6a5a)"
          @click="goSend"
        >
          <view class="i-carbon-send-alt-filled text-[28rpx] text-white" />
          <text class="text-[28rpx] font-[700] text-white">发送消息</text>
        </view>
      </view>
    </view>
  </view>
</template>
