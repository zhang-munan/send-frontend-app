<script setup lang="ts">
definePage({
  style: {
    navigationStyle: 'custom',
  },
})

const showNotice = ref(false)

const stats = [
  {
    value: '128',
    label: '已发送 条',
    icon: '↗',
    bg: '#fff0f1',
    color: '#ff5f75',
  },
  {
    value: '96',
    label: '已送达 条',
    icon: '✓',
    bg: '#fff6df',
    color: '#ffb833',
  },
  {
    value: '32',
    label: '收到回复 条',
    icon: '•••',
    bg: '#f4eeff',
    color: '#8d68ee',
  },
]

interface ServiceItem {
  title: string
  icon: string
  bg: string
  badge?: string
  extra?: string
  action?: string
}

interface ServiceGroup {
  title: string
  icon: string
  iconBg: string
  iconColor: string
  items: ServiceItem[]
}

const serviceGroups: ServiceGroup[] = [
  {
    title: '消息服务',
    icon: '♥',
    iconBg: '#fff3f4',
    iconColor: '#ff5b67',
    items: [
      { title: '我的模板', icon: '▤', bg: '#ff5a72' },
      { title: '发送记录', icon: '◷', bg: '#3f97f4' },
      { title: '我的对话', icon: '•••', bg: '#8c66ee' },
    ],
  },
  {
    title: '财务管理',
    icon: '▰',
    iconBg: '#fff6e4',
    iconColor: '#ffae2d',
    items: [
      { title: '充值中心', icon: '☻', bg: '#ff8618', badge: '首次优惠' },
      { title: '账单明细', icon: '▣', bg: '#35c96d' },
      { title: '优惠券', icon: '‡', bg: '#ff5365', extra: '3 张可用' },
    ],
  },
  {
    title: '其他服务',
    icon: '◆',
    iconBg: '#edf6ff',
    iconColor: '#4da1ff',
    items: [
      { title: '意见反馈', icon: '✎', bg: '#428ff2' },
      { title: '使用须知', icon: '!', bg: '#ffb12f', action: 'notice' },
      { title: '关于我们', icon: 'i', bg: '#8b66ee' },
      { title: '设置', icon: '⚙', bg: '#8b96a3' },
    ],
  },
]

const noticeList = [
  '本平台仅用于善意的信息传递（道歉、表白、祝福、感谢等）',
  '请尊重收件人感受，避免频繁发送造成打扰',
  '严禁发送骚扰、威胁、侮辱、违法内容',
  '对同一号码有发送频率限制',
  '收件人可回复「TD」退订，退订后不再接收',
  '违规使用将被永久封号并追究法律责任',
]

function handleItemClick(action?: string) {
  if (action === 'notice')
    showNotice.value = true
}
</script>

<template>
  <view class="relative min-h-[100vh] overflow-hidden bg-[#fff8f5] text-[#1f1715]">
    <!-- #ifdef H5 -->
    <view class="h-[22rpx]" />
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <view class="h-[56rpx]" />
    <!-- #endif -->

    <scroll-view scroll-y class="h-[100vh]" :show-scrollbar="false">
      <view class="px-[20rpx] pb-[150rpx] pt-[30rpx]">
        <view class="relative overflow-hidden rounded-[24rpx] bg-[linear-gradient(125deg,#ffd1a4_0%,#ff9b98_50%,#ffe0b5_100%)] px-[32rpx] pb-[132rpx] pt-[38rpx] shadow-[0_16rpx_42rpx_rgba(254,137,115,0.14)]">
          <image src="https://picsum.photos/seed/mine-card-soft/720/320" mode="aspectFill" class="absolute inset-[0rpx] h-[100%] w-[100%] opacity-[0.16]" />
          <view class="relative flex items-center">
            <view class="relative h-[162rpx] w-[162rpx] border-[8rpx] border-[#ffffff] rounded-[162rpx] bg-[#fff1ea] shadow-[0_10rpx_26rpx_rgba(114,63,44,0.15)]">
              <image src="https://picsum.photos/seed/warm-avatar-girl/180/180" mode="aspectFill" class="h-[100%] w-[100%] rounded-[162rpx]" />
              <view class="absolute bottom-[-8rpx] right-[-4rpx] h-[46rpx] w-[46rpx] flex items-center justify-center border-[4rpx] border-[#ffffff] rounded-[46rpx] bg-[rgb(254,137,115)]">
                <text class="text-[28rpx] text-[#ffffff] leading-[32rpx]">
                  ✎
                </text>
              </view>
            </view>

            <view class="ml-[36rpx] min-w-[0rpx] flex-1">
              <view class="flex items-center">
                <text class="max-w-[214rpx] truncate text-[38rpx] text-[#151515] leading-[48rpx] font-[900]">
                  小暖暖
                </text>
                <text class="ml-[8rpx] text-[34rpx] leading-[40rpx]">
                  🌸
                </text>
                <text class="ml-[12rpx] border-[2rpx] border-[#ffffff] rounded-[22rpx] bg-[rgba(255,96,114,0.82)] px-[20rpx] py-[6rpx] text-[22rpx] text-[#ffffff] leading-[26rpx]">
                  普通用户
                </text>
              </view>
              <view class="mt-[22rpx] flex items-center">
                <text class="text-[28rpx] text-[#2c2523] leading-[36rpx]">
                  138 **** 5678
                </text>
                <view class="ml-[18rpx] h-[28rpx] w-[28rpx] flex items-center justify-center rounded-[8rpx] bg-[rgba(255,255,255,0.38)]">
                  <text class="text-[20rpx] text-[#8f6f62] leading-[24rpx]">
                    ⧉
                  </text>
                </view>
              </view>
              <view class="mt-[20rpx] max-w-[320rpx] inline-flex rounded-[12rpx] bg-[rgba(255,255,255,0.42)] px-[14rpx] py-[8rpx]">
                <text class="truncate text-[24rpx] text-[#8a665a] leading-[30rpx]">
                  用善意表达，让世界更温暖 💛
                </text>
              </view>
            </view>

            <view class="absolute right-[0rpx] top-[26rpx] h-[44rpx] flex items-center rounded-[24rpx] bg-[rgba(255,255,255,0.58)] px-[22rpx] shadow-[0_8rpx_20rpx_rgba(111,70,45,0.12)]">
              <text class="text-[22rpx] text-[#694c42] leading-[30rpx]">
                个人主页
              </text>
              <text class="ml-[8rpx] text-[30rpx] text-[#694c42] leading-[30rpx]">
                ›
              </text>
            </view>
          </view>

          <view class="absolute bottom-[-2rpx] left-[0rpx] right-[0rpx] mx-[0rpx] rounded-t-[28rpx] bg-[#ffffff] px-[36rpx] py-[34rpx] shadow-[0_-8rpx_30rpx_rgba(255,255,255,0.48)]">
            <view class="grid grid-cols-3">
              <view v-for="(item, index) in stats" :key="item.label" class="relative flex items-center justify-center">
                <view v-if="index > 0" class="absolute left-[0rpx] top-[10rpx] h-[70rpx] w-[1rpx] bg-[#ece2df]" />
                <view class="h-[74rpx] w-[74rpx] flex items-center justify-center rounded-[74rpx]" :style="{ backgroundColor: item.bg }">
                  <text class="text-[34rpx] leading-[38rpx]" :style="{ color: item.color }">
                    {{ item.icon }}
                  </text>
                </view>
                <view class="ml-[22rpx]">
                  <text class="block text-[38rpx] text-[#050505] leading-[44rpx] font-[900]">
                    {{ item.value }}
                  </text>
                  <text class="mt-[8rpx] block text-[24rpx] text-[#5f5754] leading-[30rpx]">
                    {{ item.label }}
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-for="group in serviceGroups" :key="group.title" class="mt-[18rpx] rounded-[22rpx] bg-[#ffffff] px-[30rpx] py-[28rpx] shadow-[0_12rpx_34rpx_rgba(89,57,45,0.06)]">
          <view class="mb-[24rpx] flex items-center">
            <view class="h-[34rpx] w-[34rpx] flex items-center justify-center rounded-[34rpx]" :style="{ backgroundColor: group.iconBg }">
              <text class="text-[24rpx] leading-[28rpx]" :style="{ color: group.iconColor }">
                {{ group.icon }}
              </text>
            </view>
            <text class="ml-[14rpx] text-[28rpx] text-[#111111] leading-[36rpx] font-[800]">
              {{ group.title }}
            </text>
          </view>

          <view v-for="(item, index) in group.items" :key="item.title" class="h-[84rpx] flex items-center" @click="handleItemClick(item.action)">
            <view class="h-[38rpx] w-[38rpx] flex items-center justify-center rounded-[9rpx]" :style="{ backgroundColor: item.bg }">
              <text class="text-[22rpx] text-[#ffffff] leading-[26rpx] font-[800]">
                {{ item.icon }}
              </text>
            </view>
            <view class="ml-[30rpx] h-[84rpx] min-w-[0rpx] flex flex-1 items-center border-[#ece5e2]" :class="index === group.items.length - 1 ? 'border-b-[0rpx]' : 'border-b-[1rpx]'">
              <text class="text-[28rpx] text-[#121212] leading-[36rpx]">
                {{ item.title }}
              </text>
              <text v-if="item.badge" class="ml-[18rpx] rounded-[18rpx] bg-[#ff5d5d] px-[12rpx] py-[4rpx] text-[18rpx] text-[#ffffff] leading-[22rpx]">
                {{ item.badge }}
              </text>
              <text v-if="item.extra" class="ml-auto mr-[26rpx] text-[24rpx] text-[#ff2020] leading-[32rpx]">
                {{ item.extra }}
              </text>
              <text class="ml-auto text-[44rpx] text-[#9a9a9a] leading-[44rpx]">
                ›
              </text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="showNotice" class="fixed inset-[0rpx] z-[20] flex items-center justify-center bg-[rgba(44,30,25,0.28)] px-[84rpx]">
      <view class="max-h-[660rpx] w-[100%] rounded-[22rpx] bg-[#fffefa] px-[32rpx] py-[34rpx] shadow-[0_18rpx_58rpx_rgba(73,42,32,0.22)]">
        <text class="block text-center text-[38rpx] text-[#5b3a32] leading-[48rpx] font-[900]">
          使用须知
        </text>
        <view class="mt-[12rpx] flex items-center justify-center">
          <view class="h-[2rpx] w-[52rpx] bg-[#ffb099]" />
          <text class="mx-[18rpx] text-[24rpx] text-[rgb(254,137,115)] leading-[28rpx]">
            ♥
          </text>
          <view class="h-[2rpx] w-[52rpx] bg-[#ffb099]" />
        </view>
        <scroll-view scroll-y class="mt-[24rpx] max-h-[360rpx]" :show-scrollbar="true">
          <text class="block text-[25rpx] text-[#5b3f37] leading-[38rpx]">
            感谢你来到「帮你说出口」。在使用之前，请了解以下约定：
          </text>
          <view v-for="(item, index) in noticeList" :key="item" class="mt-[14rpx] flex">
            <text class="w-[40rpx] text-[25rpx] text-[#5b3f37] leading-[38rpx]">
              {{ index + 1 }}.
            </text>
            <text class="flex-1 text-[25rpx] text-[#5b3f37] leading-[38rpx]">
              {{ item }}
            </text>
          </view>
        </scroll-view>
        <button class="mt-[28rpx] h-[72rpx] w-[100%] border-[0rpx] rounded-[18rpx] bg-[rgb(254,137,115)] p-[0rpx] text-[30rpx] text-[#ffffff] leading-[72rpx]" @click="showNotice = false">
          我已阅读并同意
        </button>
      </view>
    </view>
  </view>
</template>
