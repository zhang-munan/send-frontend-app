<script setup lang="ts">
definePage({
  style: {
    navigationStyle: 'custom',
  },
})

const showNotice = ref(false)
const agreed = ref(false)

const statusCards = [
  {
    image: 'https://picsum.photos/seed/empty-warm/96/96',
    title: '空状态',
    desc: '暂无内容时的温柔陪伴',
  },
  {
    image: 'https://picsum.photos/seed/loading-warm/96/96',
    title: '加载中',
    desc: '请稍等，正在努力中...',
  },
  {
    image: 'https://picsum.photos/seed/error-warm/96/96',
    title: '出错啦',
    desc: '请检查网络后重试哦',
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
</script>

<template>
  <view class="relative min-h-[100vh] overflow-hidden bg-[#fffaf7] text-[#3a2420]">
    <!-- #ifdef H5 -->
    <view class="h-[22rpx]" />
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <view class="h-[56rpx]" />
    <!-- #endif -->

    <view class="h-[112rpx] flex items-center justify-center border-b-[1rpx] border-[#f1ded7] bg-[#fffaf7] px-[44rpx]">
      <text class="absolute left-[44rpx] top-[58rpx] text-[58rpx] text-[#282828] leading-[58rpx]">
        ‹
      </text>
      <text class="text-[38rpx] text-[#111111] leading-[48rpx] font-[800]">
        登录
      </text>
    </view>

    <scroll-view scroll-y class="h-[calc(100vh-112rpx)]" :show-scrollbar="false">
      <view class="relative overflow-hidden bg-[linear-gradient(180deg,#ffd2c4_0%,#fff4ee_74%,#fffaf7_100%)] pb-[156rpx]">
        <image src="https://picsum.photos/seed/login-bg-soft/750/360" mode="aspectFill" class="absolute left-[0rpx] top-[0rpx] h-[360rpx] w-[100%] opacity-[0.34]" />

        <view class="relative pt-[52rpx] text-center">
          <image src="https://picsum.photos/seed/login-envelope/150/128" mode="aspectFill" class="mx-auto h-[128rpx] w-[150rpx] rounded-[26rpx]" />
          <text class="mt-[20rpx] block text-[48rpx] text-[#8c6255] leading-[62rpx] font-[900]">
            帮你说出口
          </text>
          <text class="mt-[8rpx] block text-[28rpx] text-[#9b756a] leading-[38rpx]">
            那些说不出口的话，我们帮你送达
          </text>
        </view>

        <view class="relative mx-[34rpx] mt-[38rpx] rounded-[28rpx] bg-[rgba(255,255,255,0.94)] px-[36rpx] py-[34rpx] shadow-[0_16rpx_46rpx_rgba(120,70,48,0.12)]">
          <button class="h-[86rpx] w-[100%] flex items-center justify-center border-[0rpx] rounded-[24rpx] bg-[#55b84e] p-[0rpx] text-[#ffffff]">
            <view class="mr-[26rpx] h-[50rpx] w-[62rpx] flex items-center justify-center">
              <text class="text-[44rpx] text-[#ffffff] leading-[48rpx]">
                ☁
              </text>
            </view>
            <text class="text-[32rpx] text-[#ffffff] leading-[42rpx]">
              微信一键登录
            </text>
          </button>

          <view class="mt-[36rpx] flex items-center">
            <view class="h-[1rpx] flex-1 bg-[#e8d8d0]" />
            <text class="px-[34rpx] text-[24rpx] text-[#9a8077] leading-[32rpx]">
              其他登录方式
            </text>
            <view class="h-[1rpx] flex-1 bg-[#e8d8d0]" />
          </view>

          <view class="mt-[24rpx] h-[78rpx] flex items-center border-[1rpx] border-[#eadbd5] rounded-[16rpx] bg-[#fffdfc] px-[26rpx]">
            <text class="text-[30rpx] text-[#2b201d] leading-[38rpx]">
              +86
            </text>
            <text class="ml-[18rpx] text-[22rpx] text-[#aa9d98] leading-[28rpx]">
              ▼
            </text>
            <view class="ml-[24rpx] h-[34rpx] w-[1rpx] bg-[#eee2de]" />
            <input class="ml-[24rpx] h-[70rpx] flex-1 text-[28rpx] text-[#33201c] leading-[70rpx]" placeholder="请输入手机号" placeholder-class="text-[#b9aaa4]" type="number">
          </view>

          <view class="mt-[22rpx] h-[78rpx] flex items-center border-[1rpx] border-[#eadbd5] rounded-[16rpx] bg-[#fffdfc] px-[26rpx]">
            <input class="h-[70rpx] flex-1 text-[28rpx] text-[#33201c] leading-[70rpx]" placeholder="请输入验证码" placeholder-class="text-[#b9aaa4]" type="number">
            <button class="h-[52rpx] w-[156rpx] border-[1rpx] border-[#ffc5bc] rounded-[18rpx] bg-[#fff8f6] p-[0rpx] text-[24rpx] text-[rgb(254,137,115)] leading-[52rpx]">
              获取验证码
            </button>
          </view>

          <button class="mt-[28rpx] h-[86rpx] w-[100%] border-[0rpx] rounded-[20rpx] bg-[linear-gradient(90deg,#ffd0cb_0%,#ffb9b4_100%)] p-[0rpx] text-[32rpx] text-[#ffffff] leading-[86rpx]">
            登录/注册
          </button>

          <view class="mt-[28rpx] flex items-center">
            <view class="h-[34rpx] w-[34rpx] flex items-center justify-center border-[2rpx] border-[#cdbfb8] rounded-[8rpx]" :class="agreed ? 'bg-[rgb(254,137,115)] border-[rgb(254,137,115)]' : 'bg-[#ffffff]'" @click="agreed = !agreed">
              <text v-if="agreed" class="text-[24rpx] text-[#ffffff] leading-[28rpx]">
                ✓
              </text>
            </view>
            <text class="ml-[18rpx] text-[25rpx] text-[#6b5b55] leading-[34rpx]">
              我已阅读并同意
            </text>
            <text class="text-[25rpx] text-[rgb(254,137,115)] leading-[34rpx]" @click="showNotice = true">
              《用户协议》
            </text>
            <text class="text-[25rpx] text-[#6b5b55] leading-[34rpx]">
              和
            </text>
            <text class="text-[25rpx] text-[rgb(254,137,115)] leading-[34rpx]" @click="showNotice = true">
              《隐私政策》
            </text>
          </view>

          <view class="mt-[22rpx] flex items-center border-[1rpx] border-[#ffd9bd] rounded-[18rpx] bg-[#fff4e8] px-[22rpx] py-[18rpx]" @click="showNotice = true">
            <image src="https://picsum.photos/seed/warm-notice/74/74" mode="aspectFill" class="h-[74rpx] w-[74rpx] rounded-[18rpx]" />
            <view class="ml-[22rpx] min-w-[0rpx] flex-1">
              <text class="block text-[25rpx] text-[#3d2923] leading-[34rpx] font-[800]">
                温馨提示：
              </text>
              <text class="mt-[4rpx] block text-[25rpx] text-[#7b665e] leading-[34rpx]">
                我们只帮你传递善意的话语，守护每一次真诚表达。
              </text>
            </view>
          </view>
        </view>

        <view class="relative mt-[30rpx] px-[46rpx]">
          <view class="flex items-center justify-center">
            <view class="h-[1rpx] w-[120rpx] bg-[#f0d4c4]" />
            <text class="mx-[18rpx] text-[24rpx] text-[#9b766b] leading-[32rpx]">
              ✦ 体验小提示
            </text>
            <view class="h-[1rpx] w-[120rpx] bg-[#f0d4c4]" />
          </view>
          <view class="grid grid-cols-3 mt-[16rpx] gap-[16rpx]">
            <view v-for="item in statusCards" :key="item.title" class="h-[118rpx] border-[1rpx] border-[#f5dcd2] rounded-[16rpx] bg-[rgba(255,255,255,0.72)] px-[10rpx] py-[12rpx] text-center">
              <image :src="item.image" mode="aspectFill" class="mx-auto h-[44rpx] w-[44rpx] rounded-[14rpx]" />
              <text class="mt-[6rpx] block truncate text-[20rpx] text-[#3c2a25] leading-[26rpx] font-[700]">
                {{ item.title }}
              </text>
              <text class="mt-[2rpx] block truncate text-[17rpx] text-[#9a8178] leading-[22rpx]">
                {{ item.desc }}
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
