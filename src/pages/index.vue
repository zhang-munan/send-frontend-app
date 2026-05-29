<script setup lang="ts">
import { ref } from 'vue'

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

const currentBanner = ref(0)

function onBannerChange(e: any) {
  currentBanner.value = e.detail.current
}

const bannerList = [
  {
    image: mergeOssPath('home/banner-1.png'),
    title: '惊喜礼物',
    desc: '把心意藏进每一句话',
  },
  {
    image: mergeOssPath('home/banner-2.png'),
    title: '和好了！',
    desc: '他收到道歉短信后\n主动加回了微信',
  },
  {
    image: mergeOssPath('home/banner-3.png'),
    title: '匿名表白，\n原来 TA 也\n喜欢我',
    desc: '',
  },
]

function getBannerOffset(index: number) {
  const total = bannerList.length
  let diff = index - currentBanner.value
  if (diff > total / 2)
    diff -= total
  if (diff < -total / 2)
    diff += total
  return diff
}

function getBannerSlideStyle(index: number) {
  const offset = getBannerOffset(index)

  if (offset === 0) {
    return {
      transform: 'perspective(1200px) rotateY(0deg) scale(1)',
      transformOrigin: 'center center',
      opacity: '1',
      zIndex: '3',
    }
  }

  const rotateY = offset < 0 ? -34 : 34
  return {
    transform: `perspective(1200px) rotateY(${rotateY}deg) scale(0.92)`,
    transformOrigin: offset < 0 ? 'right center' : 'left center',
    opacity: '0.9',
    zIndex: '1',
  }
}

const quickCardsLeft = [
  { title: '表达心意', desc: '帮你传达真心话', image: mergeOssPath('home/function-heart.png'), cardBg: 'from-[#fff0f0] to-[#fff9f6]', arrowBg: '#febcb5' },
  { title: 'AI 帮写', desc: '智能生成暖心文案', image: mergeOssPath('home/function-ai.png'), cardBg: 'from-[#f1efff] to-[#fffaff]', arrowBg: '#dbd4f9' },
]

const quickCardsRight = [
  { title: '消息模板', desc: '海量模板一键使用', image: mergeOssPath('home/function-msg.png'), cardBg: 'from-[#fff5ed] to-[#fffdf8]', arrowBg: '#fdd6a9' },
  { title: '我的对话', desc: '查看历史对话记录', image: mergeOssPath('home/function-chat.png'), cardBg: 'from-[#effbf1] to-[#fbfff9]', arrowBg: '#c8e1c9' },
]

const sceneList = [
  { title: '道歉和解', desc: '给彼此一个台阶', image: mergeOssPath('home/reconciliation.png') },
  { title: '匿名表白', desc: '勇敢说出来', image: mergeOssPath('confession.png') },
  { title: '节日祝福', desc: '温暖不打扰', image: mergeOssPath('home/blessing.png') },
  { title: '感恩表达', desc: '让 TA 知道', image: mergeOssPath('home/gratitude.png') },
  { title: '毕业告别', desc: '不说再见', image: mergeOssPath('home/farewell.png') },
  { title: '重要通知', desc: '帮你转达', image: mergeOssPath('home/notification.png') },
]

const templateList = [
  { title: '真诚道歉短信', tag: '道歉和解', image: mergeOssPath('home/temp-reconciliation.png') },
  { title: '匿名喜欢你', tag: '匿名表白', image: mergeOssPath('home/temp-confession.png') },
  { title: '母亲节祝福', tag: '节日祝福', image: mergeOssPath('home/temp-blessing.png') },
  { title: '谢谢你的照顾', tag: '感恩表达', image: mergeOssPath('home/temp-gratitude.png') },
  { title: '毕业祝福', tag: '毕业告别', image: mergeOssPath('home/temp-farewell.png') },
]

const storyList = [
  {
    name: '匿名用户A',
    initials: 'A',
    avatarBg: '#ffb8a0',
    content: '鼓起勇气发了道歉短信，没想到她愿意原谅我了，我们又和好了！',
    like: '1.2w',
  },
  {
    name: '小C',
    initials: 'C',
    avatarBg: '#ffa8c8',
    content: '用了匿名表白模板，TA 猜到是我后也很开心，现在我们在一起啦～',
    like: '9.8k',
  },
  {
    name: '匿名用户B',
    initials: 'B',
    avatarBg: '#a8d8b0',
    content: '给老师发送了感恩短信，老师回复了我，真的超感动！',
    like: '6.3k',
  },
]
</script>

<template>
  <view class="min-h-[100vh] overflow-hidden bg-[linear-gradient(180deg,#fef7f5_0%,#ffffff_100%)] text-[#4a2b24]">
    <!-- #ifndef H5 -->
    <view :style="{ height: `${statusBarHeight}px` }" />
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <view class="h-[22rpx]" />
    <!-- #endif -->

    <!-- 顶部导航栏 -->
    <view class="px-[20rpx] pb-[20rpx]">
      <view class="h-[92rpx] flex items-center justify-center">
        <view class="flex items-center gap-[16rpx]">
          <image :src="mergeOssPath('logo-heart.png')" mode="aspectFit" class="h-[80rpx] w-[80rpx]" />
          <text class="text-[36rpx] text-[#7a5147] font-bold leading-[40rpx]">
            帮你说出口
          </text>
        </view>
      </view>

      <!-- 提示横幅 -->
      <view class="mt-[16rpx] h-[80rpx] flex items-center border-[1rpx] border-[#f5dcc0] rounded-[20rpx] border-solid bg-[#fef1e1] px-[20rpx] shadow-[0_8rpx_24rpx_rgba(254,137,115,0.10)]">
        <image :src="mergeOssPath('safe.png')" mode="aspectFit" class="h-[42rpx] w-[42rpx] flex-shrink-0" />
        <text class="ml-[16rpx] flex-1 text-[26rpx] text-[#6a3b29] leading-[36rpx] font-[600]">
          每一次善意的表达，都可能温暖一个人 💛
        </text>
      </view>
    </view>

    <!-- 轮播 Banner -->
    <view class="banner-swiper-wrap">
      <swiper
        class="banner-swiper h-[260rpx] w-[100%]"
        :current="currentBanner"
        :autoplay="true"
        :interval="3000"
        :circular="true"
        previous-margin="100rpx"
        next-margin="100rpx"
        @change="onBannerChange"
      >
        <swiper-item v-for="(item, index) in bannerList" :key="item.title" class="banner-swiper-item">
          <view
            class="banner-slide relative box-border h-[260rpx] w-[100%] overflow-hidden border-[6rpx] border-[#ffffff] rounded-[24rpx] border-solid bg-white"
            :style="getBannerSlideStyle(index)"
          >
            <image :src="item.image" mode="scaleToFill" class="absolute h-[100%] rounded-[24rpx]" />
            <view v-if="index !== 2" class="absolute inset-[0rpx] bg-[linear-gradient(90deg,rgba(255,240,226,0.92),rgba(255,240,226,0.15))]" />
            <view v-if="index === 2" class="absolute inset-[0rpx] bg-[linear-gradient(180deg,rgba(255,240,226,0.0),rgba(255,230,210,0.75))]" />
            <view class="relative px-[24rpx] pt-[28rpx]">
              <text class="block whitespace-pre-line text-[30rpx] text-[#6a321f] leading-[42rpx] font-[800]">
                {{ item.title }}
              </text>
              <text v-if="item.desc" class="mt-[8rpx] block whitespace-pre-line text-[24rpx] text-[#7d4434] leading-[36rpx] font-[500]">
                {{ item.desc }}
              </text>
              <view v-if="index === 1" class="mt-[18rpx] h-[52rpx] w-[154rpx] flex items-center justify-center rounded-[52rpx] bg-[rgb(254,137,115)]">
                <view class="flex items-center justify-center gap-[4rpx]">
                  <text class="text-[24rpx] text-[#ffffff] leading-[30rpx] font-[600]">
                    查看详情
                  </text>
                  <view class="i-carbon-chevron-right text-[22rpx] text-white" />
                </view>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 轮播指示点 -->
    <view class="mt-[16rpx] flex justify-center gap-[10rpx]">
      <view
        v-for="(item, index) in bannerList"
        :key="index"
        class="h-[12rpx] rounded-[12rpx]"
        :class="index === currentBanner ? 'w-[28rpx] bg-[rgb(254,137,115)]' : 'w-[12rpx] bg-[#e7d8d1]'"
      />
    </view>

    <!-- 功能快捷入口 -->
    <view class="mt-[20rpx] box-border w-full flex gap-[16rpx] px-[20rpx]">
      <view class="box-border min-w-0 flex flex-1 flex-col gap-[16rpx] overflow-hidden rounded-[24rpx] bg-white p-[6rpx]">
        <view
          v-for="item in quickCardsLeft"
          :key="item.title"
          class="relative box-border h-[138rpx] min-w-0 w-full flex items-center overflow-hidden rounded-[20rpx] bg-gradient-to-r px-[16rpx]"
          :class="item.cardBg"
        >
          <image :src="item.image" mode="aspectFit" class="h-[76rpx] w-[76rpx] flex-shrink-0 rounded-[18rpx]" />
          <view class="ml-[12rpx] min-w-0 flex-1 overflow-hidden">
            <text class="text-regular block truncate text-[28rpx] leading-[38rpx] font-[800]">
              {{ item.title }}
            </text>
            <text class="text-secondary mt-[4rpx] block truncate text-[20rpx] leading-[28rpx]">
              {{ item.desc }}
            </text>
          </view>
          <view
            class="ml-[8rpx] h-[40rpx] w-[40rpx] flex flex-shrink-0 items-center justify-center rounded-[40rpx]"
            :style="{ backgroundColor: item.arrowBg }"
          >
            <view class="i-carbon-chevron-right text-[22rpx] text-white" />
          </view>
        </view>
      </view>
      <view class="box-border min-w-0 flex flex-1 flex-col gap-[16rpx] overflow-hidden rounded-[24rpx] bg-white p-[6rpx]">
        <view
          v-for="item in quickCardsRight"
          :key="item.title"
          class="relative box-border h-[138rpx] min-w-0 w-full flex items-center overflow-hidden rounded-[20rpx] bg-gradient-to-r px-[16rpx]"
          :class="item.cardBg"
        >
          <image :src="item.image" mode="aspectFit" class="h-[76rpx] w-[76rpx] flex-shrink-0 rounded-[18rpx]" />
          <view class="ml-[12rpx] min-w-0 flex-1 overflow-hidden">
            <text class="text-regular block truncate text-[28rpx] leading-[38rpx] font-[800]">
              {{ item.title }}
            </text>
            <text class="text-secondary mt-[4rpx] block truncate text-[20rpx] leading-[28rpx]">
              {{ item.desc }}
            </text>
          </view>
          <view
            class="ml-[8rpx] h-[40rpx] w-[40rpx] flex flex-shrink-0 items-center justify-center rounded-[40rpx]"
            :style="{ backgroundColor: item.arrowBg }"
          >
            <view class="i-carbon-chevron-right text-[22rpx] text-white" />
          </view>
        </view>
      </view>
    </view>

    <!-- 使用场景 -->
    <view class="mt-[36rpx] px-[20rpx]">
      <view class="flex items-center justify-between">
        <view class="flex items-center">
          <text class="ml-[8rpx] text-[30rpx] text-[#4b2f28] leading-[38rpx] font-[800]">
            使用场景
          </text>
        </view>
        <view class="flex items-center gap-[4rpx]">
          <text class="text-[24rpx] text-[#8c756e] leading-[32rpx]">
            更多场景
          </text>
          <view class="i-carbon-chevron-right text-[20rpx] text-[#8c756e]" />
        </view>
      </view>
    </view>

    <scroll-view scroll-x class="mt-[20rpx] w-[100%] whitespace-nowrap" :show-scrollbar="false">
      <view class="inline-flex gap-[16rpx] px-[20rpx]">
        <view
          v-for="item in sceneList"
          :key="item.title"
          class="inline-block w-[120rpx] overflow-hidden border-[1px] border-[#fcebe6] rounded-[20rpx] border-solid bg-[#fffdfa] px-[10rpx] pb-[16rpx] pt-[14rpx] text-center"
        >
          <image :src="item.image" mode="aspectFill" class="mx-auto h-[72rpx] w-[72rpx] rounded-[18rpx]" />
          <text class="mt-[10rpx] block truncate text-[22rpx] text-[#4b3028] leading-[30rpx] font-[700]">
            {{ item.title }}
          </text>
          <text class="mt-[2rpx] block truncate text-[18rpx] text-[#9b7e73] leading-[26rpx]">
            {{ item.desc }}
          </text>
        </view>
      </view>
    </scroll-view>

    <!-- 热门模板推荐 -->
    <view class="mt-[36rpx] px-[20rpx]">
      <view class="flex items-center justify-between">
        <view class="flex items-center">
          <text class="ml-[8rpx] text-[30rpx] text-[#4b2f28] leading-[38rpx] font-[800]">
            热门模板推荐
          </text>
        </view>
        <view class="flex items-center gap-[4rpx]">
          <text class="text-[24rpx] text-[#8c756e] leading-[32rpx]">
            查看更多
          </text>
          <view class="i-carbon-chevron-right text-[20rpx] text-[#8c756e]" />
        </view>
      </view>
    </view>

    <scroll-view scroll-x class="w-[100%] whitespace-nowrap" :show-scrollbar="false">
      <view class="inline-flex gap-[16rpx] px-[20rpx] py-[20rpx]">
        <view
          v-for="item in templateList"
          :key="item.title"
          class="inline-block w-[168rpx] overflow-hidden rounded-[18rpx] bg-[#ffffff]"
          style="box-shadow: 0 5rpx 15rpx rgba(254,137,115,0.10);"
        >
          <image :src="item.image" mode="aspectFill" class="h-[108rpx] w-[100%]" />
          <view class="px-[12rpx] pb-[14rpx] pt-[10rpx] text-center">
            <text class="block truncate text-[22rpx] text-[#321d18] leading-[30rpx] font-[700]">
              {{ item.title }}
            </text>
            <text class="mt-[8rpx] inline-block rounded-[24rpx] bg-[#fff0ea] px-[14rpx] py-[4rpx] text-[18rpx] text-[rgb(254,137,115)] leading-[24rpx] font-[600]">
              {{ item.tag }}
            </text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 他们的故事 -->
    <view class="mt-[16rpx] px-[20rpx] pb-[40rpx]">
      <view class="flex items-center">
        <text class="ml-[8rpx] text-[30rpx] text-[#4b2f28] leading-[38rpx] font-[800]">
          他们的故事
        </text>
      </view>
      <scroll-view scroll-x class="mt-[20rpx] w-[100%] whitespace-nowrap" :show-scrollbar="false">
        <view class="inline-flex gap-[16rpx]">
          <view
            v-for="item in storyList"
            :key="item.name"
            class="inline-block w-[256rpx] border-[1px] border-[1px] border-[#fcebe6] rounded-[20rpx] border-solid bg-[#fffdfb] p-[20rpx] shadow-[0_8rpx_24rpx_rgba(120,70,48,0.07)]"
          >
            <view class="flex items-start">
              <view
                class="h-[56rpx] w-[56rpx] flex flex-shrink-0 items-center justify-center rounded-[56rpx] text-[24rpx] text-[#ffffff] font-[700]"
                :style="{ backgroundColor: item.avatarBg }"
              >
                {{ item.initials }}
              </view>
              <view class="ml-[14rpx] min-w-[0rpx] flex-1">
                <text class="block truncate text-[22rpx] text-[#4d3028] leading-[30rpx] font-[700]">
                  {{ item.name }}
                </text>
                <text class="mt-[6rpx] block text-[20rpx] text-[#6d5148] leading-[30rpx]" style="white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  {{ item.content }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped>
.banner-swiper-wrap {
  perspective: 1200px;
  overflow: visible;
}

.banner-swiper {
  overflow: visible;
}

.banner-swiper-item {
  overflow: visible;
}

.banner-slide {
  transform-origin: center center;
  transition: transform 0.45s ease, opacity 0.45s ease;
}
</style>
