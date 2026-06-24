<script setup lang="ts">
import { getRecordList, resendMessage, type MessageRecord } from '@/api/message'

const statusBarHeight = ref(0)
// #ifndef H5
statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0
// #endif

definePage({
  layout: false,
  style: { navigationStyle: 'custom' },
})

// ─── 状态过滤 ────────────────────────────────────────
const FILTER_TABS = [
  { label: '全部', value: -1 },
  { label: '已送达', value: 5 },
  { label: '发送中', value: 4 },
  { label: '发送失败', value: 6 },
  { label: '待发送', value: 3 },
]

const activeFilter = ref(-1)
const filterCounts = ref<Record<number, number>>({})
const showFilter = ref(false)

// ─── 列表状态 ────────────────────────────────────────
const list = ref<MessageRecord[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 15
const loading = ref(false)
const noMore = ref(false)

// ─── 状态映射 ────────────────────────────────────────
interface StatusMeta { label: string; color: string; icon: string; bgColor: string }
const STATUS_META: Record<number, StatusMeta> = {
  0: { label: '待审核', color: '#ff8c00', icon: 'i-carbon-time', bgColor: '#fff7ed' },
  1: { label: '审核通过', color: '#34c759', icon: 'i-carbon-checkmark-outline', bgColor: '#f0fdf4' },
  2: { label: '审核拒绝', color: '#f44336', icon: 'i-carbon-close-outline', bgColor: '#fef2f2' },
  3: { label: '待发送', color: '#a0a0a0', icon: 'i-carbon-time', bgColor: '#f5f5f5' },
  4: { label: '发送中', color: '#1e7cf5', icon: 'i-carbon-hourglass', bgColor: '#eff6ff' },
  5: { label: '已送达', color: '#34c759', icon: 'i-carbon-checkmark-filled', bgColor: '#f0fdf4' },
  6: { label: '发送失败', color: '#f44336', icon: 'i-carbon-close-filled', bgColor: '#fef2f2' },
  7: { label: '已取消', color: '#a0a0a0', icon: 'i-carbon-subtract-alt', bgColor: '#f5f5f5' },
}

function statusMeta(status: number): StatusMeta {
  return STATUS_META[status] ?? { label: '未知', color: '#a0a0a0', icon: 'i-carbon-help', bgColor: '#f5f5f5' }
}

// ─── 日期分组 ────────────────────────────────────────
interface GroupedList {
  date: string
  items: MessageRecord[]
}

const groupedList = computed<GroupedList[]>(() => {
  const map = new Map<string, MessageRecord[]>()
  for (const item of list.value) {
    const date = formatDate(item.createTime)
    if (!map.has(date)) map.set(date, [])
    map.get(date)!.push(item)
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }))
})

function formatDate(t: string) {
  if (!t) return ''
  const d = t.replace('T', ' ').substring(0, 10)
  const [y, m, day] = d.split('-')
  return `${y}年${m}月${day}日`
}

function formatTime(t: string) {
  if (!t) return ''
  return t.replace('T', ' ').substring(11, 16)
}

// ─── 加载列表 ────────────────────────────────────────
async function loadList(reset = false) {
  if (loading.value) return
  if (!reset && noMore.value) return
  if (reset) {
    page.value = 1
    noMore.value = false
    list.value = []
  }
  loading.value = true
  try {
    const statusParam = activeFilter.value === -1 ? undefined : activeFilter.value
    const res = await getRecordList(page.value, pageSize, statusParam)
    list.value.push(...res.list)
    total.value = res.total
    if (list.value.length >= res.total) noMore.value = true
    page.value++
  }
  catch (err: any) {
    uni.showToast({ title: err?.message || '加载失败', icon: 'none' })
  }
  finally {
    loading.value = false
  }
}

// ─── 切换过滤 ────────────────────────────────────────
function switchFilter(val: number) {
  if (activeFilter.value === val) return
  activeFilter.value = val
  loadList(true)
}

// ─── 重新发送 ────────────────────────────────────────
const resendingId = ref<number | null>(null)
async function handleResend(item: MessageRecord) {
  if (resendingId.value) return
  resendingId.value = item.id
  try {
    await resendMessage(item.id)
    uni.showToast({ title: '已重新发送', icon: 'success' })
    await loadList(true)
  }
  catch (err: any) {
    uni.showToast({ title: err?.message || '重新发送失败', icon: 'none' })
  }
  finally {
    resendingId.value = null
  }
}

// ─── 跳转详情 ────────────────────────────────────────
function goDetail(id: number) {
  uni.navigateTo({ url: `/package-send/send-record-detail?id=${id}` })
}

function goBack() { uni.navigateBack() }

onMounted(() => loadList(true))
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
        发送记录
      </text>
      <view class="ml-auto h-[72rpx] w-[72rpx] flex items-center justify-center" @click="showFilter = !showFilter">
        <view class="i-carbon-filter text-[36rpx] text-[#a08a84]" />
      </view>
    </view>

    <!-- 状态筛选 tabs -->
    <scroll-view scroll-x class="whitespace-nowrap px-[20rpx] pb-[16rpx]">
      <view class="inline-flex gap-[12rpx]">
        <view
          v-for="tab in FILTER_TABS"
          :key="tab.value"
          class="inline-flex items-center rounded-[28rpx] px-[28rpx] py-[12rpx] text-[24rpx] font-[600] transition-all"
          :class="activeFilter === tab.value
            ? 'bg-[#fe8973] text-white'
            : 'bg-white text-[#7d6d68]'"
          :style="activeFilter !== tab.value ? 'box-shadow:0 1rpx 8rpx rgba(89,57,45,0.08)' : ''"
          @click="switchFilter(tab.value)"
        >
          {{ tab.label }}
          <text v-if="tab.value === -1 && total > 0" class="ml-[6rpx]">{{ total }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 列表 -->
    <scroll-view
      scroll-y
      class="h-[calc(100vh-220rpx)] px-[24rpx]"
      @scrolltolower="loadList(false)"
    >
      <!-- 空状态 -->
      <view v-if="!loading && list.length === 0" class="flex flex-col items-center justify-center py-[120rpx]">
        <text class="text-[80rpx]">📮</text>
        <text class="mt-[20rpx] text-[28rpx] text-[#a08a84]">暂无发送记录</text>
        <view
          class="mt-[40rpx] rounded-[18rpx] bg-[#fe8973] px-[48rpx] py-[18rpx]"
          @click="uni.switchTab({ url: '/pages/index' })"
        >
          <text class="text-[28rpx] font-[700] text-white">去发送</text>
        </view>
      </view>

      <!-- 分组列表 -->
      <view v-for="group in groupedList" :key="group.date" class="mb-[8rpx]">
        <!-- 日期分组标题 -->
        <view class="py-[16rpx]">
          <text class="text-[24rpx] text-[#c4b3ae]">{{ group.date }}</text>
        </view>

        <!-- 消息卡片 -->
        <view
          v-for="item in group.items"
          :key="item.id"
          class="mb-[12rpx] rounded-[20rpx] bg-white px-[24rpx] py-[20rpx]"
          style="box-shadow: 0 2rpx 12rpx rgba(89,57,45,0.06);"
          @click="goDetail(item.id)"
        >
          <view class="flex items-start gap-[20rpx]">
            <!-- 状态图标 -->
            <view
              class="h-[72rpx] w-[72rpx] flex flex-shrink-0 items-center justify-center rounded-full"
              :style="{ backgroundColor: statusMeta(item.status).bgColor }"
            >
              <view
                class="text-[36rpx]"
                :class="statusMeta(item.status).icon"
                :style="{ color: statusMeta(item.status).color }"
              />
            </view>

            <!-- 内容 -->
            <view class="min-w-0 flex-1">
              <view class="flex items-center justify-between">
                <text class="text-[30rpx] font-[700] text-[#4a2b24]">{{ item.receiverPhoneMask }}</text>
                <!-- 发送失败标签 -->
                <text
                  v-if="item.status === 6"
                  class="rounded-[8rpx] px-[12rpx] py-[4rpx] text-[22rpx] font-[600]"
                  style="background:#fef2f2; color:#f44336;"
                >
                  发送失败
                </text>
              </view>
              <text class="mt-[6rpx] block truncate text-[26rpx] leading-[40rpx] text-[#7a5147]">
                {{ item.content }}
              </text>
              <view class="mt-[8rpx] flex items-center justify-between">
                <view class="flex items-center gap-[12rpx]">
                  <text class="text-[22rpx] text-[#c4b3ae]">{{ formatTime(item.createTime) }}</text>
                  <view
                    class="rounded-[8rpx] px-[10rpx] py-[2rpx] text-[20rpx]"
                    :style="item.isAnonymous ? 'background:#fff3e0;color:#e65100' : 'background:#e8f5e9;color:#2e7d32'"
                  >
                    <text>{{ item.isAnonymous ? '匿名' : '实名' }}</text>
                  </view>
                </view>
                <!-- 待发送/定时 -->
                <text v-if="item.status === 3 && item.scheduledAt" class="text-[22rpx] text-[#a0a0a0]">
                  待发送
                </text>
              </view>
              <!-- 重新发送按钮 -->
              <view v-if="item.status === 6" class="mt-[12rpx] flex justify-end">
                <view
                  class="rounded-[14rpx] px-[24rpx] py-[10rpx] text-[24rpx] font-[600] text-white"
                  style="background: linear-gradient(135deg,#fe8973,#fe6a5a);"
                  @click.stop="handleResend(item)"
                >
                  {{ resendingId === item.id ? '发送中...' : '重新发送' }}
                </view>
              </view>
            </view>

            <!-- 箭头 -->
            <view class="i-carbon-chevron-right flex-shrink-0 text-[28rpx] text-[#d4c4bf]" />
          </view>
        </view>
      </view>

      <!-- 底部提示 -->
      <view class="py-[30rpx] text-center">
        <text v-if="loading" class="text-[24rpx] text-[#c4b3ae]">加载中...</text>
        <text v-else-if="noMore && list.length > 0" class="text-[24rpx] text-[#c4b3ae]">已显示全部记录</text>
      </view>
    </scroll-view>
  </view>
</template>
