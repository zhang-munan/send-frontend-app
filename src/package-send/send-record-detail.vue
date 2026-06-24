<script setup lang="ts">
import { getMessageDetail, resendMessage, cancelMessage, type MessageRecord } from '@/api/message'

const statusBarHeight = ref(0)
// #ifndef H5
statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0
// #endif

definePage({
  layout: false,
  style: { navigationStyle: 'custom' },
})

// ─── 路由参数 ────────────────────────────────────────
const id = ref(0)
onLoad((options) => {
  id.value = Number(options?.id || 0)
  if (id.value) loadDetail()
})

// ─── 数据 ────────────────────────────────────────────
const detail = ref<MessageRecord | null>(null)
const loading = ref(false)

async function loadDetail() {
  loading.value = true
  try {
    detail.value = await getMessageDetail(id.value)
  }
  catch (err: any) {
    uni.showToast({ title: err?.message || '加载失败', icon: 'none' })
  }
  finally {
    loading.value = false
  }
}

// ─── 状态信息 ────────────────────────────────────────
interface StatusMeta { label: string; color: string; bgColor: string; icon: string }
const STATUS_META: Record<number, StatusMeta> = {
  0: { label: '待审核', color: '#ff8c00', bgColor: '#fff9f0', icon: '🕐' },
  1: { label: '审核通过', color: '#34c759', bgColor: '#f0fdf4', icon: '✅' },
  2: { label: '审核拒绝', color: '#f44336', bgColor: '#fff5f5', icon: '❌' },
  3: { label: '待发送', color: '#a0a0a0', bgColor: '#f5f5f5', icon: '🕐' },
  4: { label: '发送中', color: '#1e7cf5', bgColor: '#eff6ff', icon: '📤' },
  5: { label: '已送达', color: '#34c759', bgColor: '#f0fdf4', icon: '✅' },
  6: { label: '发送失败', color: '#f44336', bgColor: '#fff5f5', icon: '❌' },
  7: { label: '已取消', color: '#a0a0a0', bgColor: '#f5f5f5', icon: '🚫' },
}

function statusMeta(s: number): StatusMeta {
  return STATUS_META[s] ?? { label: '未知', color: '#a0a0a0', bgColor: '#f5f5f5', icon: '❓' }
}

function formatTime(t?: string | null) {
  if (!t) return '-'
  return t.replace('T', ' ').substring(0, 16)
}

// ─── 操作 ────────────────────────────────────────────
const operating = ref(false)

async function handleResend() {
  if (operating.value || !detail.value) return
  operating.value = true
  try {
    await resendMessage(detail.value.id)
    uni.showToast({ title: '已重新发送', icon: 'success' })
    await loadDetail()
  }
  catch (err: any) {
    uni.showToast({ title: err?.message || '操作失败', icon: 'none' })
  }
  finally {
    operating.value = false
  }
}

async function handleCancel() {
  if (operating.value || !detail.value) return
  uni.showModal({
    title: '确认取消',
    content: '确定要取消这条定时消息吗？',
    success: async (res) => {
      if (!res.confirm) return
      operating.value = true
      try {
        await cancelMessage(detail.value!.id)
        uni.showToast({ title: '已取消', icon: 'success' })
        await loadDetail()
      }
      catch (err: any) {
        uni.showToast({ title: err?.message || '操作失败', icon: 'none' })
      }
      finally {
        operating.value = false
      }
    },
  })
}

function goSend() {
  uni.navigateTo({ url: '/package-send/send' })
}

function goConversation() {
  if (!detail.value?.conversationId) return
  uni.navigateTo({ url: `/package-send/conversation-detail?id=${detail.value.conversationId}&phone=${detail.value.receiverPhoneMask}` })
}

function goBack() { uni.navigateBack() }
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
        发送详情
      </text>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="flex justify-center py-[80rpx]">
      <text class="text-[28rpx] text-[#a08a84]">加载中...</text>
    </view>

    <scroll-view v-else-if="detail" scroll-y class="h-[calc(100vh-88rpx)] pb-[160rpx]">
      <!-- ① 状态卡片 -->
      <view class="mx-[24rpx] mb-[24rpx] overflow-hidden rounded-[24rpx] bg-white" style="box-shadow:0 4rpx 20rpx rgba(89,57,45,0.08)">
        <view
          class="relative px-[32rpx] py-[32rpx]"
          :style="{ background: `linear-gradient(135deg, ${statusMeta(detail.status).bgColor}, #ffffff)` }"
        >
          <!-- 信封装饰图 -->
          <view class="absolute right-[24rpx] top-[20rpx] text-[100rpx] opacity-20">💌</view>

          <!-- 状态标题 -->
          <view class="flex items-center gap-[16rpx]">
            <view
              class="h-[56rpx] w-[56rpx] flex items-center justify-center rounded-full text-[28rpx]"
              :style="{ backgroundColor: statusMeta(detail.status).color + '22' }"
            >
              <text>{{ statusMeta(detail.status).icon }}</text>
            </view>
            <text class="text-[40rpx] font-[900]" :style="{ color: statusMeta(detail.status).color }">
              {{ statusMeta(detail.status).label }}
            </text>
          </view>

          <!-- 状态说明 -->
          <text v-if="detail.status === 5" class="mt-[12rpx] block text-[26rpx] text-[#a08a84]">
            你的心意已送达，给对方一些时间吧 💛
          </text>
          <text v-else-if="detail.status === 6" class="mt-[12rpx] block text-[26rpx] text-[#f44336]">
            {{ detail.failReason || '发送失败，请重新发送' }}
          </text>
          <text v-else-if="detail.status === 3" class="mt-[12rpx] block text-[26rpx] text-[#a08a84]">
            消息将在设定时间发出
          </text>
          <text v-else-if="detail.status === 4" class="mt-[12rpx] block text-[26rpx] text-[#1e7cf5]">
            消息正在路上...
          </text>

          <!-- 时间信息 -->
          <view class="mt-[20rpx] space-y-[8rpx]">
            <view class="flex items-center gap-[16rpx]">
              <text class="w-[120rpx] text-[24rpx] text-[#c4b3ae]">发送时间</text>
              <text class="text-[26rpx] text-[#4a2b24]">{{ formatTime(detail.createTime) }}</text>
            </view>
            <view v-if="detail.deliveredAt" class="flex items-center gap-[16rpx]">
              <text class="w-[120rpx] text-[24rpx] text-[#c4b3ae]">送达时间</text>
              <text class="text-[26rpx] text-[#4a2b24]">{{ formatTime(detail.deliveredAt) }}</text>
            </view>
            <view v-if="detail.scheduledAt && detail.status === 3" class="flex items-center gap-[16rpx]">
              <text class="w-[120rpx] text-[24rpx] text-[#c4b3ae]">计划发送</text>
              <text class="text-[26rpx] text-[#4a2b24]">{{ formatTime(detail.scheduledAt) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- ② 消息内容 -->
      <view class="mx-[24rpx] mb-[24rpx] rounded-[24rpx] bg-white px-[32rpx] py-[28rpx]" style="box-shadow:0 4rpx 20rpx rgba(89,57,45,0.08)">
        <view class="mb-[20rpx] flex items-center gap-[12rpx]">
          <text class="text-[28rpx]">💬</text>
          <text class="text-[28rpx] font-[800] text-[#4a2b24]">消息内容</text>
        </view>

        <!-- 内容区 -->
        <view class="rounded-[16rpx] bg-[#fef7f5] p-[24rpx]">
          <text class="text-[30rpx] leading-[50rpx] text-[#4a2b24]">{{ detail.content }}</text>
        </view>

        <!-- 元信息 -->
        <view class="mt-[16rpx] flex flex-wrap gap-x-[24rpx] gap-y-[8rpx]">
          <text class="text-[22rpx] text-[#a08a84]">字数：{{ detail.contentLength }} 字</text>
          <text class="text-[22rpx] text-[#a08a84]">·</text>
          <text class="text-[22rpx] text-[#a08a84]">计费条数：{{ detail.smsCount }} 条</text>
          <text class="text-[22rpx] text-[#a08a84]">·</text>
          <text class="text-[22rpx] text-[#a08a84]">{{ detail.sendType === 2 ? '定时发送' : '立即发送' }}</text>
          <text class="text-[22rpx] text-[#a08a84]">·</text>
          <text class="text-[22rpx] text-[#a08a84]">{{ detail.isAnonymous ? '匿名' : '实名' }}</text>
          <template v-if="!detail.isAnonymous && detail.senderSignature">
            <text class="text-[22rpx] text-[#a08a84]">·</text>
            <text class="text-[22rpx] text-[#a08a84]">签名：{{ detail.senderSignature }}</text>
          </template>
        </view>
      </view>

      <!-- ③ 发送信息 -->
      <view class="mx-[24rpx] mb-[24rpx] rounded-[24rpx] bg-white px-[32rpx] py-[28rpx]" style="box-shadow:0 4rpx 20rpx rgba(89,57,45,0.08)">
        <view class="mb-[20rpx] flex items-center gap-[12rpx]">
          <text class="text-[28rpx]">👤</text>
          <text class="text-[28rpx] font-[800] text-[#4a2b24]">发送信息</text>
        </view>
        <view class="space-y-[16rpx]">
          <view class="flex items-center justify-between">
            <text class="text-[26rpx] text-[#a08a84]">收件人</text>
            <text class="text-[26rpx] font-[600] text-[#4a2b24]">{{ detail.receiverPhoneMask }}</text>
          </view>
          <view class="h-[1rpx] bg-[#f5ece9]" />
          <view class="flex items-center justify-between">
            <text class="text-[26rpx] text-[#a08a84]">发送方式</text>
            <text class="text-[26rpx] text-[#4a2b24]">{{ detail.sendType === 2 ? '定时发送' : '立即发送' }}</text>
          </view>
          <view class="h-[1rpx] bg-[#f5ece9]" />
          <view class="flex items-center justify-between">
            <text class="text-[26rpx] text-[#a08a84]">发送身份</text>
            <text class="text-[26rpx] text-[#4a2b24]">{{ detail.isAnonymous ? '匿名发送' : '实名发送' }}</text>
          </view>
          <template v-if="!detail.isAnonymous && detail.senderSignature">
            <view class="h-[1rpx] bg-[#f5ece9]" />
            <view class="flex items-center justify-between">
              <text class="text-[26rpx] text-[#a08a84]">签名</text>
              <text class="text-[26rpx] text-[#4a2b24]">{{ detail.senderSignature }}</text>
            </view>
          </template>
          <view class="h-[1rpx] bg-[#f5ece9]" />
          <view class="flex items-center justify-between">
            <text class="text-[26rpx] text-[#a08a84]">发送费用</text>
            <text class="text-[26rpx] font-[700] text-[#fe8973]">¥{{ Number(detail.feeAmount).toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <!-- ④ 对方回复 -->
      <view
        v-if="detail.reply"
        class="mx-[24rpx] mb-[24rpx] overflow-hidden rounded-[24rpx] bg-white"
        style="box-shadow:0 4rpx 20rpx rgba(89,57,45,0.08)"
      >
        <view class="px-[32rpx] py-[28rpx]">
          <view class="mb-[20rpx] flex items-center gap-[12rpx]">
            <text class="text-[28rpx]">💬</text>
            <text class="text-[28rpx] font-[800] text-[#4a2b24]">对方回复</text>
          </view>
          <view class="rounded-[16rpx] bg-[#f0fdf4] p-[24rpx]">
            <text class="text-[30rpx] leading-[50rpx] text-[#2d5a27]">{{ detail.reply.replyContent }}</text>
          </view>
          <view class="mt-[16rpx] flex items-center justify-between">
            <text class="text-[22rpx] text-[#a08a84]">回复时间：{{ formatTime(detail.reply.receivedAt) }}</text>
            <view
              v-if="detail.conversationId"
              class="flex items-center gap-[6rpx] rounded-[20rpx] border border-[#fe8973] px-[20rpx] py-[8rpx]"
              @click="goConversation"
            >
              <text class="text-[24rpx] font-[600] text-[#fe8973]">继续对话</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 无回复提示 -->
      <view v-else-if="detail.status === 5" class="mx-[24rpx] mb-[24rpx] rounded-[24rpx] bg-white px-[32rpx] py-[32rpx]" style="box-shadow:0 4rpx 20rpx rgba(89,57,45,0.08)">
        <view class="flex flex-col items-center py-[20rpx]">
          <text class="text-[60rpx]">💌</text>
          <text class="mt-[12rpx] text-[26rpx] text-[#a08a84]">对方还未回复，耐心等待吧</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作按钮 -->
    <view v-if="detail" class="fixed bottom-0 left-0 right-0 px-[24rpx] pb-[40rpx] pt-[20rpx]" style="background:linear-gradient(to top,#fef7f5 80%,transparent)">
      <!-- 发送失败：重新发送 -->
      <view v-if="detail.status === 6" class="flex gap-[16rpx]">
        <view
          class="flex-1 rounded-[28rpx] py-[24rpx] text-center text-[30rpx] font-[700] text-[#fe8973]"
          style="border:2rpx solid #fe8973;"
          @click="goSend"
        >
          重新编辑
        </view>
        <view
          class="flex-1 rounded-[28rpx] py-[24rpx] text-center text-[30rpx] font-[700] text-white"
          style="background:linear-gradient(135deg,#fe8973,#fe6a5a);"
          @click="handleResend"
        >
          {{ operating ? '发送中...' : '直接重发' }}
        </view>
      </view>

      <!-- 待发送：可取消 -->
      <view v-else-if="detail.status === 3" class="flex gap-[16rpx]">
        <view
          class="flex-1 rounded-[28rpx] py-[24rpx] text-center text-[30rpx] font-[700] text-[#f44336]"
          style="border:2rpx solid #f44336;"
          @click="handleCancel"
        >
          取消发送
        </view>
        <view
          class="flex-1 rounded-[28rpx] py-[24rpx] text-center text-[30rpx] font-[700] text-white"
          style="background:linear-gradient(135deg,#fe8973,#fe6a5a);"
          @click="goSend"
        >
          再次发送
        </view>
      </view>

      <!-- 已送达 -->
      <view v-else-if="detail.status === 5" class="flex gap-[16rpx]">
        <view
          class="flex-1 rounded-[28rpx] py-[24rpx] text-center text-[30rpx] font-[700] text-[#fe8973]"
          style="border:2rpx solid #fe8973;"
          @click="goSend"
        >
          再次发送
        </view>
        <view
          v-if="detail.conversationId"
          class="flex-1 rounded-[28rpx] py-[24rpx] text-center text-[30rpx] font-[700] text-white"
          style="background:linear-gradient(135deg,#fe8973,#fe6a5a);"
          @click="goConversation"
        >
          查看对话
        </view>
      </view>

      <!-- 其他状态 -->
      <view v-else class="flex gap-[16rpx]">
        <view
          class="flex-1 rounded-[28rpx] py-[24rpx] text-center text-[30rpx] font-[700] text-white"
          style="background:linear-gradient(135deg,#fe8973,#fe6a5a);"
          @click="goSend"
        >
          再次发送
        </view>
      </view>
    </view>
  </view>
</template>
