<script setup lang="ts">
import { getTemplateList, type TemplateInfo } from '@/api/template'

definePage({
  layout: false,
  style: {
    navigationBarTitleText: '模板',
  },
})

// ─── Category tabs ────────────────────────────────────────────────────────────
interface CategoryTab {
  label: string
  value: string
}

const CATEGORY_TABS: CategoryTab[] = [
  { label: '全部', value: '' },
  { label: '道歉和解', value: 'apology' },
  { label: '真心表白', value: 'confession' },
  { label: '节日祝福', value: 'blessing' },
  { label: '感谢感恩', value: 'gratitude' },
  { label: '温暖关心', value: 'care' },
  { label: '事务通知', value: 'notice' },
  { label: '毕业告别', value: 'graduation' },
  { label: '通用', value: 'general' },
]

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

// ─── Search & filter state ────────────────────────────────────────────────────
const keyword = ref('')
const activeCategory = ref('')
const searchInput = ref('')

// ─── Hot templates (首屏推荐) ─────────────────────────────────────────────────
const hotList = ref<TemplateInfo[]>([])

async function fetchHotList() {
  try {
    const res = await getTemplateList({ sort: 'hot', size: 6 })
    hotList.value = res.list
  }
  catch (_) {}
}

// ─── Template list ────────────────────────────────────────────────────────────
const list = ref<TemplateInfo[]>([])
const total = ref(0)
const page = ref(1)
const PAGE_SIZE = 10
const loading = ref(false)
const noMore = ref(false)

async function fetchList(reset = false) {
  if (loading.value) return
  if (!reset && noMore.value) return
  loading.value = true
  if (reset) {
    page.value = 1
    noMore.value = false
  }
  try {
    const res = await getTemplateList({
      category: activeCategory.value || undefined,
      keyword: keyword.value || undefined,
      page: page.value,
      size: PAGE_SIZE,
    })
    if (reset) {
      list.value = res.list
    }
    else {
      list.value = [...list.value, ...res.list]
    }
    total.value = res.total
    noMore.value = list.value.length >= res.total
    page.value++
  }
  catch (_) {}
  finally {
    loading.value = false
  }
}

// ─── Pull-down refresh / pull-up load ─────────────────────────────────────────
async function onRefresh() {
  await Promise.all([fetchHotList(), fetchList(true)])
  uni.stopPullDownRefresh()
}

onPullDownRefresh(onRefresh)

onReachBottom(() => {
  fetchList()
})

// ─── Category switch ───────────────────────────────────────────────────────────
function switchCategory(val: string) {
  if (activeCategory.value === val) return
  activeCategory.value = val
  fetchList(true)
}

// ─── Search ───────────────────────────────────────────────────────────────────
function onSearchConfirm() {
  keyword.value = searchInput.value
  fetchList(true)
}

function onSearchClear() {
  searchInput.value = ''
  keyword.value = ''
  fetchList(true)
}

// ─── Navigate to detail ────────────────────────────────────────────────────────
function goDetail(id: number) {
  uni.navigateTo({ url: `/package-template/template-detail?id=${id}` })
}

// ─── Format usage count ────────────────────────────────────────────────────────
function formatCount(count: number) {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}千`
  return String(count)
}

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  fetchHotList()
  fetchList(true)
})

onShow(() => {
  fetchList(true)
})
</script>

<template>
  <view class="min-h-[100vh] bg-[#fdf7f5]">
    <!-- ── 搜索栏 ── -->
    <view class="sticky top-0 z-[10] bg-[#fdf7f5] px-[24rpx] pb-[16rpx] pt-[20rpx]">
      <view class="flex items-center gap-[16rpx]">
        <view class="flex flex-1 items-center gap-[12rpx] rounded-[40rpx] bg-[#ffffff] px-[24rpx] py-[16rpx] shadow-[0_4rpx_16rpx_rgba(254,137,115,0.10)]">
          <view class="i-carbon-search flex-shrink-0 text-[28rpx] text-[#c4aba4]" />
          <input
            v-model="searchInput"
            class="flex-1 text-[26rpx] text-[#3d2019] leading-[36rpx]"
            placeholder="搜索模板..."
            placeholder-class="text-[#c4aba4]"
            confirm-type="search"
            @confirm="onSearchConfirm"
            @input="searchInput = $event.detail.value"
          />
          <view
            v-if="searchInput"
            class="i-carbon-close-outline flex-shrink-0 text-[28rpx] text-[#c4aba4]"
            @click="onSearchClear"
          />
        </view>
        <view class="h-[72rpx] w-[72rpx] flex flex-shrink-0 items-center justify-center rounded-[20rpx] bg-[#ffffff] shadow-[0_4rpx_16rpx_rgba(254,137,115,0.10)]">
          <view class="i-carbon-filter text-[30rpx] text-[#8c756e]" />
        </view>
      </view>

      <!-- ── 分类 Tabs ── -->
      <scroll-view scroll-x class="mt-[16rpx] w-[100%] whitespace-nowrap" :show-scrollbar="false">
        <view class="inline-flex gap-[12rpx] pb-[4rpx]">
          <view
            v-for="tab in CATEGORY_TABS"
            :key="tab.value"
            class="inline-flex items-center rounded-[36rpx] px-[24rpx] py-[10rpx] text-[26rpx] leading-[34rpx] font-[600] transition-all"
            :class="activeCategory === tab.value
              ? 'bg-[rgb(254,137,115)] text-[#ffffff] shadow-[0_4rpx_12rpx_rgba(254,137,115,0.35)]'
              : 'bg-[#ffffff] text-[#7a5147]'"
            @click="switchCategory(tab.value)"
          >
            {{ tab.label }}
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="px-[24rpx] pb-[40rpx]">
      <!-- ── 热门推荐（仅全部分类展示）── -->
      <view v-if="!activeCategory && hotList.length" class="mb-[28rpx]">
        <view class="mb-[16rpx] flex items-center justify-between">
          <view class="flex items-center gap-[8rpx]">
            <view class="i-carbon-flame text-[30rpx] text-[rgb(254,137,115)]" />
            <text class="text-[30rpx] text-[#3d2019] leading-[40rpx] font-[800]">
              热门推荐
            </text>
          </view>
          <view class="flex items-center gap-[4rpx]">
            <text class="text-[24rpx] text-[#8c756e] leading-[32rpx]">
              查看更多
            </text>
            <view class="i-carbon-caret-right text-[20rpx] text-[#8c756e]" />
          </view>
        </view>
        <scroll-view scroll-x class="w-[100%] whitespace-nowrap" :show-scrollbar="false">
          <view class="inline-flex gap-[16rpx]">
            <view
              v-for="item in hotList"
              :key="item.id"
              class="inline-block w-[188rpx] overflow-hidden rounded-[20rpx] bg-[#ffffff] shadow-[0_6rpx_18rpx_rgba(254,137,115,0.12)]"
              @click="goDetail(item.id)"
            >
              <image
                :src="getCategoryImage(item.category)"
                mode="aspectFill"
                class="h-[120rpx] w-[100%]"
              />
              <view class="px-[14rpx] pb-[16rpx] pt-[12rpx]">
                <text class="block truncate text-[24rpx] text-[#3d2019] leading-[32rpx] font-[700]">
                  {{ item.title }}
                </text>
                <view class="mt-[8rpx] flex items-center justify-between">
                  <text class="rounded-[20rpx] bg-[#fff0ea] px-[10rpx] py-[3rpx] text-[18rpx] text-[rgb(254,137,115)] leading-[24rpx] font-[600]">
                    {{ getCategoryLabel(item.category) }}
                  </text>
                </view>
                <view class="mt-[8rpx] flex items-center gap-[4rpx]">
                  <view class="i-carbon-flame text-[18rpx] text-[rgb(254,137,115)]" />
                  <text class="text-[18rpx] text-[#a07870] leading-[24rpx]">
                    {{ formatCount(item.useCount) }}人使用
                  </text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- ── 小贴士 ── -->
      <view class="mb-[20rpx] flex items-center gap-[10rpx] rounded-[16rpx] bg-[#fff8e6] px-[20rpx] py-[14rpx]">
        <view class="i-carbon-location-filled flex-shrink-0 text-[26rpx] text-[#ffb833]" />
        <text class="flex-1 text-[22rpx] text-[#7a6542] leading-[32rpx]">
          小贴士：选择合适的模板，让你的心意更容易被对方感受到
        </text>
      </view>

      <!-- ── 模板列表 ── -->
      <view class="flex flex-col gap-[16rpx]">
        <view
          v-for="item in list"
          :key="item.id"
          class="flex items-start gap-[16rpx] rounded-[20rpx] bg-[#ffffff] p-[20rpx] shadow-[0_6rpx_18rpx_rgba(89,57,45,0.07)]"
          @click="goDetail(item.id)"
        >
          <!-- 封面图 -->
          <image
            :src="getCategoryImage(item.category)"
            mode="aspectFill"
            class="h-[108rpx] w-[108rpx] flex-shrink-0 rounded-[14rpx]"
          />

          <!-- 内容 -->
          <view class="min-w-[0rpx] flex-1">
            <text class="block truncate text-[28rpx] text-[#2c1810] leading-[38rpx] font-[700]">
              {{ item.title }}
            </text>
            <text
              class="mt-[6rpx] block text-[24rpx] text-[#7a6560] leading-[34rpx]"
              style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;"
            >
              {{ item.content }}
            </text>
            <!-- 标签行 -->
            <view class="mt-[10rpx] flex flex-wrap items-center gap-[8rpx]">
              <text class="rounded-[20rpx] bg-[#fff0ea] px-[12rpx] py-[3rpx] text-[20rpx] text-[rgb(254,137,115)] leading-[26rpx] font-[600]">
                {{ getCategoryLabel(item.category) }}
              </text>
              <view class="flex items-center gap-[4rpx]">
                <view class="i-carbon-group text-[18rpx] text-[#a07870]" />
                <text class="text-[20rpx] text-[#a07870] leading-[26rpx]">
                  {{ formatCount(item.useCount) }}人使用
                </text>
              </view>
              <text
                v-for="tag in (item.tags || []).slice(0, 1)"
                :key="tag"
                class="rounded-[20rpx] bg-[#f5f0ff] px-[12rpx] py-[3rpx] text-[20rpx] text-[#8b66ee] leading-[26rpx]"
              >
                {{ tag }}
              </text>
            </view>
          </view>

          <!-- 收藏心形 -->
          <view class="flex-shrink-0 pt-[4rpx]">
            <view class="i-carbon-favorite text-[40rpx] text-[#e0c8c0]" />
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="!loading && list.length === 0" class="mt-[80rpx] flex flex-col items-center">
          <view class="i-carbon-document-unknown text-[100rpx] text-[#e0ccc6]" />
          <text class="mt-[20rpx] text-[26rpx] text-[#b09890] leading-[36rpx]">
            没有找到相关模板，试试其他关键词
          </text>
          <text class="mt-[8rpx] text-[22rpx] text-[#c4b3ae] leading-[30rpx]">
            换个词试试，或清除筛选条件
          </text>
        </view>

        <!-- 底部加载状态 -->
        <view v-if="list.length > 0" class="mt-[8rpx] flex justify-center py-[24rpx]">
          <text v-if="loading" class="text-[24rpx] text-[#b09890] leading-[32rpx]">
            加载中...
          </text>
          <text v-else-if="noMore" class="text-[24rpx] text-[#c4b3ae] leading-[32rpx]">
            已经到底啦
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
