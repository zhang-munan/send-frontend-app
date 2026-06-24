<script setup lang="ts">
import { collectTemplate, getTemplateDetail, getTemplateList, type TemplateInfo } from '@/api/template'

definePage({
  layout: false,
  style: {
    navigationStyle: 'custom',
    navigationBarTextStyle: 'black',
  },
})

// ─── System bar height ────────────────────────────────────────────────────────
const statusBarHeight = ref(0)
// #ifndef H5
statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0
// #endif

// ─── Route param ─────────────────────────────────────────────────────────────
const templateId = ref(0)

// ─── Data ─────────────────────────────────────────────────────────────────────
const detail = ref<TemplateInfo | null>(null)
const similarList = ref<TemplateInfo[]>([])
const collecting = ref(false)

// ─── Category map ─────────────────────────────────────────────────────────────
const CATEGORY_LABEL_MAP: Record<string, string> = {
  apology: '道歉和解',
  confession: '真心表白',
  blessing: '节日祝福',
  gratitude: '感谢感恩',
  care: '温暖关心',
  notice: '事务通知',
  graduation: '毕业告别',
  general: '通用',
}

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  apology: 'home/temp-reconciliation.png',
  confession: 'home/temp-confession.png',
  blessing: 'home/temp-blessing.png',
  gratitude: 'home/temp-gratitude.png',
  graduation: 'home/temp-farewell.png',
  care: 'home/function-heart.png',
  notice: 'home/function-msg.png',
  general: 'home/function-msg.png',
}

function getCategoryLabel(category: string) {
  return CATEGORY_LABEL_MAP[category] || category
}

function getCategoryImage(category: string) {
  return mergeOssPath(CATEGORY_IMAGE_MAP[category] || 'home/function-msg.png')
}

// ─── Format usage count ────────────────────────────────────────────────────────
function formatCount(count: number) {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}千`
  return String(count)
}

// ─── Fetch ─────────────────────────────────────────────────────────────────────
async function fetchDetail() {
  if (!templateId.value) return
  try {
    const res = await getTemplateDetail(templateId.value)
    detail.value = res
    fetchSimilar(res.category)
  }
  catch (_) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

async function fetchSimilar(category: string) {
  try {
    const res = await getTemplateList({ category, size: 8 })
    similarList.value = res.list.filter(t => t.id !== templateId.value).slice(0, 4)
  }
  catch (_) {}
}

// ─── Copy content ──────────────────────────────────────────────────────────────
function copyContent() {
  if (!detail.value) return
  uni.setClipboardData({
    data: detail.value.content,
    success: () => {
      uni.showToast({ title: '已复制全文', icon: 'success' })
    },
  })
}

// ─── Toggle collect ────────────────────────────────────────────────────────────
async function toggleCollect() {
  if (!detail.value) return
  const userStore = useUserStore()
  if (!userStore.isLogin) {
    uni.navigateTo({ url: '/package-user/login' })
    return
  }
  if (collecting.value) return
  collecting.value = true
  try {
    const res = await collectTemplate(detail.value.id)
    detail.value = {
      ...detail.value,
      isCollected: res.collected,
      collectCount: res.collected
        ? detail.value.collectCount + 1
        : Math.max(0, detail.value.collectCount - 1),
    }
    uni.showToast({
      title: res.collected ? '收藏成功' : '已取消收藏',
      icon: 'none',
    })
  }
  catch (_) {}
  finally {
    collecting.value = false
  }
}

// ─── Use template ─────────────────────────────────────────────────────────────
function useTemplate() {
  if (!detail.value) return
  uni.navigateTo({
    url: `/package-send/send?content=${encodeURIComponent(detail.value.content)}&templateId=${detail.value.id}`,
  })
}

// ─── Share ────────────────────────────────────────────────────────────────────
function onShare() {
  uni.showShareMenu({ withShareTicket: true })
}

// ─── Navigate to similar detail ───────────────────────────────────────────────
function goSimilar(id: number) {
  uni.navigateTo({ url: `/package-template/template-detail?id=${id}` })
}

// ─── Back ─────────────────────────────────────────────────────────────────────
function goBack() {
  uni.navigateBack()
}

// ─── Init ─────────────────────────────────────────────────────────────────────
onLoad((options) => {
  templateId.value = Number(options?.id || 0)
  fetchDetail()
})
</script>

<template>
  <view class="min-h-[100vh] bg-[#fdf7f5]">
    <!-- ── Status bar ── -->
    <!-- #ifndef H5 -->
    <view :style="{ height: `${statusBarHeight}px` }" class="bg-[#fdf7f5]" />
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <view class="h-[22rpx] bg-[#fdf7f5]" />
    <!-- #endif -->

    <!-- ── Custom nav bar ── -->
    <view class="flex h-[88rpx] items-center justify-between px-[20rpx]">
      <view
        class="h-[64rpx] w-[64rpx] flex items-center justify-center rounded-[64rpx] bg-[rgba(255,255,255,0.85)]"
        @click="goBack"
      >
        <view class="i-carbon-chevron-left text-[32rpx] text-[#4a2b24]" />
      </view>
      <text class="text-[32rpx] text-[#2c1810] leading-[44rpx] font-[700]">
        模板详情
      </text>
      <view class="flex items-center gap-[16rpx]">
        <view
          class="h-[64rpx] w-[64rpx] flex items-center justify-center rounded-[64rpx] bg-[rgba(255,255,255,0.85)]"
          @click="toggleCollect"
        >
          <view
            class="text-[30rpx]"
            :class="detail?.isCollected ? 'i-carbon-favorite-filled text-[rgb(254,137,115)]' : 'i-carbon-favorite text-[#7a5147]'"
          />
        </view>
        <view
          class="h-[64rpx] w-[64rpx] flex items-center justify-center rounded-[64rpx] bg-[rgba(255,255,255,0.85)]"
          @click="onShare"
        >
          <view class="i-carbon-share text-[28rpx] text-[#7a5147]" />
        </view>
      </view>
    </view>

    <view class="px-[24rpx] pb-[180rpx]">
      <!-- ── 模板内容预览卡片 ── -->
      <view
        class="overflow-hidden rounded-[28rpx] p-[4rpx]"
        style="background: linear-gradient(135deg, #ffe0d6 0%, #ffc8c8 40%, #ffcfa8 100%);"
      >
        <!-- 匿名消息标签 -->
        <view class="flex justify-center pb-[10rpx] pt-[18rpx]">
          <view
            v-if="detail?.isAnonymous"
            class="flex items-center gap-[8rpx] rounded-[30rpx] px-[20rpx] py-[8rpx]"
            style="background: rgba(255,255,255,0.55);"
          >
            <view class="i-carbon-infinite text-[22rpx] text-[#7a4a3c]" />
            <text class="text-[22rpx] text-[#7a4a3c] leading-[28rpx] font-[600]">
              匿名消息
            </text>
          </view>
        </view>

        <!-- 正文白卡 -->
        <view class="rounded-[22rpx] bg-[#ffffff] px-[30rpx] py-[28rpx]">
          <text
            class="block text-[28rpx] text-[#3d2019] leading-[46rpx]"
            style="white-space: pre-wrap;"
          >
            {{ detail?.content || '' }}
          </text>
        </view>

        <!-- 标签 + 字数 + 复制 -->
        <view class="flex items-center justify-between px-[4rpx] pb-[10rpx] pt-[16rpx]">
          <view class="flex items-center gap-[12rpx]">
            <text class="text-[22rpx] text-[#7a4a3c] leading-[28rpx] font-[600]">
              {{ getCategoryLabel(detail?.category || '') }}
            </text>
            <text v-if="(detail?.tags || []).length" class="text-[22rpx] text-[#7a4a3c] leading-[28rpx]">
              {{ (detail?.tags || []).join('·') }}
            </text>
            <text class="text-[22rpx] text-[#a07060] leading-[28rpx]">
              · {{ detail?.content?.length || 0 }}字
            </text>
          </view>
          <view
            class="flex items-center gap-[6rpx]"
            @click="copyContent"
          >
            <view class="i-carbon-copy text-[22rpx] text-[#7a4a3c]" />
            <text class="text-[22rpx] text-[#7a4a3c] leading-[28rpx]">
              点击可复制全文
            </text>
          </view>
        </view>
      </view>

      <!-- ── 模板信息卡 ── -->
      <view class="mt-[20rpx] flex items-start gap-[20rpx] rounded-[24rpx] bg-[#ffffff] p-[24rpx] shadow-[0_8rpx_24rpx_rgba(89,57,45,0.08)]">
        <image
          :src="getCategoryImage(detail?.category || '')"
          mode="aspectFill"
          class="h-[108rpx] w-[108rpx] flex-shrink-0 rounded-[18rpx]"
        />
        <view class="min-w-[0rpx] flex-1">
          <text class="block text-[30rpx] text-[#2c1810] leading-[40rpx] font-[800]">
            {{ detail?.title || '' }}
          </text>
          <text
            class="mt-[8rpx] block text-[24rpx] text-[#7a6560] leading-[34rpx]"
            style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;"
          >
            {{ detail?.content || '' }}
          </text>
          <view class="mt-[12rpx] flex items-center gap-[6rpx]">
            <view class="i-carbon-group text-[22rpx] text-[rgb(254,137,115)]" />
            <text class="text-[22rpx] text-[#a07870] leading-[28rpx]">
              已有 <text class="text-[rgb(254,137,115)] font-[700]">{{ formatCount(detail?.useCount || 0) }}</text> 人使用
            </text>
          </view>
        </view>
      </view>

      <!-- ── 温馨使用建议 ── -->
      <view
        v-if="detail?.usageTip"
        class="mt-[20rpx] flex items-start gap-[20rpx] rounded-[24rpx] p-[24rpx]"
        style="background: linear-gradient(135deg, #fff8e6 0%, #fff3d4 100%);"
      >
        <view
          class="h-[72rpx] w-[72rpx] flex flex-shrink-0 items-center justify-center rounded-[18rpx]"
          style="background: linear-gradient(135deg, #ffd36a 0%, #ffb933 100%);"
        >
          <view class="i-carbon-security text-[36rpx] text-[#ffffff]" />
        </view>
        <view class="min-w-[0rpx] flex-1">
          <text class="block text-[26rpx] text-[#7a5c00] leading-[36rpx] font-[800]">
            温馨使用建议
          </text>
          <text class="mt-[8rpx] block text-[24rpx] text-[#8a6b20] leading-[36rpx]">
            {{ detail.usageTip }}
          </text>
        </view>
      </view>

      <!-- ── 相似模板推荐 ── -->
      <view v-if="similarList.length" class="mt-[28rpx]">
        <view class="mb-[16rpx] flex items-center justify-between">
          <text class="text-[30rpx] text-[#2c1810] leading-[40rpx] font-[800]">
            相似模板推荐
          </text>
          <view
            class="flex items-center gap-[4rpx]"
            @click="uni.switchTab({ url: '/pages/template' })"
          >
            <text class="text-[24rpx] text-[#8c756e] leading-[32rpx]">
              查看更多
            </text>
            <view class="i-carbon-caret-right text-[20rpx] text-[#8c756e]" />
          </view>
        </view>
        <view class="grid grid-cols-4 gap-[12rpx]">
          <view
            v-for="item in similarList"
            :key="item.id"
            class="overflow-hidden rounded-[16rpx] bg-[#ffffff] shadow-[0_4rpx_12rpx_rgba(89,57,45,0.08)]"
            @click="goSimilar(item.id)"
          >
            <image
              :src="getCategoryImage(item.category)"
              mode="aspectFill"
              class="h-[80rpx] w-[100%]"
            />
            <view class="px-[8rpx] pb-[10rpx] pt-[8rpx] text-center">
              <text
                class="block text-[18rpx] text-[#3d2019] leading-[26rpx] font-[600]"
                style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;"
              >
                {{ item.title }}
              </text>
              <text class="mt-[4rpx] block truncate text-[16rpx] text-[rgb(254,137,115)] leading-[22rpx]">
                {{ getCategoryLabel(item.category) }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- ── 底部操作栏 ── -->
    <view
      class="fixed bottom-0 left-0 right-0 flex items-center gap-[16rpx] bg-[#ffffff] px-[24rpx] pb-[env(safe-area-inset-bottom)] pt-[16rpx] shadow-[0_-4rpx_20rpx_rgba(89,57,45,0.10)]"
    >
      <view
        class="h-[88rpx] flex flex-1 items-center justify-center gap-[8rpx] rounded-[44rpx] border-[2rpx] border-solid"
        :class="detail?.isCollected ? 'border-[rgb(254,137,115)] bg-[#fff5f3]' : 'border-[#d4b8b2] bg-[#ffffff]'"
        @click="toggleCollect"
      >
        <view
          class="text-[30rpx]"
          :class="detail?.isCollected ? 'i-carbon-favorite-filled text-[rgb(254,137,115)]' : 'i-carbon-favorite text-[#7a5147]'"
        />
        <text
          class="text-[28rpx] leading-[36rpx] font-[700]"
          :class="detail?.isCollected ? 'text-[rgb(254,137,115)]' : 'text-[#7a5147]'"
        >
          {{ detail?.isCollected ? '已收藏' : '收藏模板' }}
        </text>
      </view>
      <view
        class="h-[88rpx] flex flex-[2] items-center justify-center rounded-[44rpx] shadow-[0_8rpx_24rpx_rgba(254,137,115,0.35)]"
        style="background: linear-gradient(135deg, #fe8973 0%, #ff6b55 100%);"
        @click="useTemplate"
      >
        <text class="text-[30rpx] text-[#ffffff] leading-[36rpx] font-[800]">
          使用此模板
        </text>
      </view>
    </view>
  </view>
</template>
