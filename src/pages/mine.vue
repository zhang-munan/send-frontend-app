<script setup lang="ts">
import { getBalance } from '@/api/order'

const statusBarHeight = ref(0)
// #ifndef H5
statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0
// #endif

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTextStyle: 'black',
  },
})

const userStore = useUserStore()

const isLogin = computed(() => userStore.isLogin)
const userInfo = computed(() => userStore.userInfo)

// 头像：未设置时使用默认占位
const avatarUrl = computed(() => userInfo.value?.avatarUrl || 'https://picsum.photos/seed/warm-avatar-girl/180/180')
// 昵称
const displayName = computed(() => userInfo.value?.nickName || '未设置昵称')
// 手机号脱敏展示
const maskedPhone = computed(() => {
  const phone = userInfo.value?.phone
  if (!phone)
    return '未绑定手机号'
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1 **** $2')
})

const showNotice = ref(false)
const userQuota = ref(0)
const userBalance = ref('0.00')

// 进入页面时若已登录则刷新用户信息和余额
onShow(() => {
  if (userStore.isLogin) {
    userStore.fetchUserInfo().catch(() => {})
    getBalance().then((b) => {
      userQuota.value = b.messageQuota
      userBalance.value = Number(b.balance).toFixed(2)
    }).catch(() => {})
  }
})

/** 跳转登录页 */
function goLogin() {
  uni.navigateTo({ url: '/package-user/login' })
}

/** 退出登录 */
function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'none' })
      }
    },
  })
}

const stats = computed(() => [
  {
    value: userBalance.value,
    label: '账户余额(元)',
    icon: 'i-carbon-wallet',
    bg: '#fff0f1',
    color: '#ff5f75',
    prefix: '¥',
  },
  {
    value: String(userQuota.value),
    label: '剩余条数',
    icon: 'i-carbon-send-alt-filled',
    bg: '#fff6df',
    color: '#ffb833',
    prefix: '',
  },
  {
    value: '',
    label: '充值中心',
    icon: 'i-carbon-flash-filled',
    bg: '#f4eeff',
    color: '#8d68ee',
    prefix: '',
    action: 'recharge',
  },
])

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
  iconColor: string
  items: ServiceItem[]
}

const serviceGroups: ServiceGroup[] = [
  {
    title: '消息服务',
    icon: 'i-carbon-favorite-filled',
    iconColor: '#ff5b67',
    items: [
      { title: '我的模板', icon: 'i-carbon-bookmark-filled', bg: '#ff5a72' },
      { title: '发送记录', icon: 'i-carbon-time-filled', bg: '#3f97f4' },
      { title: '我的对话', icon: 'i-carbon-phone-filled', bg: '#8c66ee' },
    ],
  },
  {
    title: '财务管理',
    icon: 'i-carbon-star-filled',
    iconColor: '#ffae2d',
    items: [
      { title: '充值中心', icon: 'i-carbon-flash-filled', bg: '#ff8618', badge: '首充优惠' },
      { title: '账单明细', icon: 'i-carbon-view-filled', bg: '#35c96d' },
      { title: '优惠券', icon: 'i-carbon-percentage-filled', bg: '#ff5365', extra: '3 张可用' },
    ],
  },
  {
    title: '其他服务',
    icon: 'i-carbon-rule-filled',
    iconColor: '#4da1ff',
    items: [
      { title: '意见反馈', icon: 'i-carbon-thumbs-up-filled', bg: '#428ff2' },
      { title: '使用须知', icon: 'i-carbon-warning-alt-filled', bg: '#ffb12f', action: 'notice' },
      { title: '关于我们', icon: 'i-carbon-information-filled', bg: '#8b66ee' },
      { title: '设置', icon: 'i-carbon-settings-filled', bg: '#8b96a3' },
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

/** 需要登录才能访问的页面 */
const AUTH_PAGES = new Set(['/package-order/orders'])

function handleItemClick(item: ServiceItem) {
  const { action, title } = item
  if (action === 'notice') {
    showNotice.value = true
    return
  }
  const navMap: Record<string, string> = {
    '充值中心': '/package-order/recharge',
    '账单明细': '/package-order/orders',
    '发送记录': '/package-send/send-records',
    '我的模板': '/pages/template',
    '我的对话': '/pages/message',
    '设置': '/package-user/settings',
    '意见反馈': '/package-feedback/feedback',
  }
  const url = navMap[title]
  if (!url) return

  // 需要登录才能访问的页面，未登录时跳转登录页
  if (AUTH_PAGES.has(url) && !userStore.isLogin) {
    uni.navigateTo({ url: '/package-user/login' })
    return
  }

  // tabBar 页用 switchTab，否则用 navigateTo
  const tabPages = new Set(['/pages/index', '/pages/message', '/pages/template', '/pages/mine'])
  if (tabPages.has(url)) {
    uni.switchTab({ url })
  }
  else {
    uni.navigateTo({ url })
  }
}
</script>

<template>
  <view class="relative min-h-[100vh] overflow-hidden bg-[linear-gradient(180deg,#fef7f5_0%,#ffffff_100%)] text-[#4a2b24]">
    <!-- #ifndef H5 -->
    <view :style="{ height: `${statusBarHeight}px` }" />
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <view class="h-[22rpx]" />
    <!-- #endif -->

    <view class="px-[20rpx] pb-[150rpx]">
      <!-- 用户信息卡片 -->
      <view class="relative overflow-hidden rounded-[28rpx] bg-[linear-gradient(125deg,#ffd1a4_0%,#ff9b98_50%,#ffe0b5_100%)] px-[32rpx] pb-[174rpx] pt-[36rpx] shadow-[0_16rpx_42rpx_rgba(254,137,115,0.22)]">
        <!-- 已登录 -->
        <view v-if="isLogin" class="relative flex items-center">
          <!-- 头像 -->
          <view class="relative h-[184rpx] w-[184rpx] flex-shrink-0 shadow-[0_8rpx_20rpx_rgba(114,63,44,0.15)]">
            <view class="box-border h-[100%] w-[100%] overflow-hidden border-[4rpx] border-[#ffffff] rounded-[184rpx] border-solid">
              <image :src="avatarUrl" mode="aspectFill" class="h-[100%] w-[100%] rounded-[184rpx]" />
            </view>
            <view class="absolute bottom-[4rpx] right-[4rpx] z-[1] box-border h-[48rpx] w-[48rpx] flex items-center justify-center border-[3rpx] border-[#ffffff] rounded-[48rpx] border-solid bg-[rgb(254,137,115)]">
              <view class="i-carbon-edit text-[24rpx] text-white" />
            </view>
          </view>

          <!-- 用户信息 -->
          <view class="ml-[28rpx] min-w-[0rpx] flex-1">
            <view class="flex items-center gap-[8rpx]">
              <text class="max-w-[180rpx] truncate text-[36rpx] text-[#1a0e0b] leading-[46rpx] font-[900]">
                {{ displayName }}
              </text>
              <text class="text-[30rpx] leading-[36rpx]">
                🌸
              </text>
              <text class="border-[2rpx] border-[#ffffff] rounded-[22rpx] bg-[rgba(255,96,114,0.82)] px-[16rpx] py-[5rpx] text-[20rpx] text-[#ffffff] leading-[24rpx]">
                普通用户
              </text>
            </view>

            <view class="mt-[16rpx] flex items-center gap-[12rpx]">
              <text class="text-[26rpx] text-[#2c2523] leading-[34rpx]">
                {{ maskedPhone }}
              </text>
            </view>

            <view class="mt-[14rpx] max-w-[300rpx] inline-flex rounded-[12rpx] bg-[rgba(255,255,255,0.40)] px-[14rpx] py-[8rpx]">
              <text class="truncate text-[22rpx] text-[#7a5147] leading-[28rpx]">
                {{ userInfo?.description || '用善意表达，让世界更温暖 💛' }}
              </text>
            </view>
          </view>

          <!-- 个人主页按钮 -->
          <view class="absolute right-[0rpx] top-[20rpx] h-[42rpx] flex items-center gap-[4rpx] rounded-[24rpx] bg-[rgba(255,255,255,0.56)] px-[18rpx] shadow-[0_4rpx_14rpx_rgba(111,70,45,0.10)]">
            <text class="text-[22rpx] text-[#694c42] leading-[28rpx]">
              个人主页
            </text>
            <view class="i-carbon-chevron-right text-[18rpx] text-[#694c42]" />
          </view>
        </view>

        <!-- 未登录 -->
        <view v-else class="relative flex items-center" @click="goLogin">
          <view class="relative h-[184rpx] w-[184rpx] flex-shrink-0 shadow-[0_8rpx_20rpx_rgba(114,63,44,0.15)]">
            <view class="box-border h-[100%] w-[100%] flex items-center justify-center overflow-hidden border-[4rpx] border-[#ffffff] rounded-[184rpx] border-solid bg-[rgba(255,255,255,0.45)]">
              <view class="i-carbon-user-avatar-filled-alt text-[110rpx] text-white" />
            </view>
          </view>

          <view class="ml-[28rpx] min-w-[0rpx] flex-1">
            <text class="block text-[36rpx] text-[#1a0e0b] leading-[46rpx] font-[900]">
              登录 / 注册
            </text>
            <text class="mt-[14rpx] block text-[26rpx] text-[#2c2523] leading-[34rpx]">
              登录后体验完整的暖心服务
            </text>
            <view class="mt-[18rpx] inline-flex items-center gap-[6rpx] rounded-[28rpx] bg-[rgba(255,255,255,0.62)] px-[24rpx] py-[10rpx] shadow-[0_4rpx_14rpx_rgba(111,70,45,0.10)]">
              <text class="text-[24rpx] text-[#a23a2f] leading-[30rpx] font-[700]">
                立即登录
              </text>
              <view class="i-carbon-chevron-right text-[20rpx] text-[#a23a2f]" />
            </view>
          </view>
        </view>

        <!-- 数据统计浮层 -->
        <view class="absolute bottom-[-2rpx] left-[0rpx] right-[0rpx] rounded-t-[28rpx] bg-[#ffffff] px-[20rpx] py-[48rpx] shadow-[0_-6rpx_24rpx_rgba(255,255,255,0.50)]">
          <view class="grid grid-cols-3">
            <view
              v-for="(item, index) in stats"
              :key="item.label"
              class="relative flex items-center justify-center"
              @click="item.action === 'recharge' && uni.navigateTo({ url: '/package-order/recharge' })"
            >
              <view v-if="index > 0" class="absolute left-[0rpx] top-[8rpx] mx-8rpx h-[64rpx] w-[1rpx] bg-[#f1f1f1]" />
              <view class="h-[68rpx] w-[68rpx] flex flex-shrink-0 items-center justify-center rounded-[68rpx]" :style="{ backgroundColor: item.bg }">
                <view class="text-[32rpx]" :class="item.icon" :style="{ color: item.color }" />
              </view>
              <view class="ml-[20rpx]">
                <text v-if="item.action === 'recharge'" class="block text-[28rpx] text-[#8d68ee] font-bold leading-[42rpx] underline">
                  {{ isLogin ? '去充值 →' : '-' }}
                </text>
                <text v-else class="block text-[30rpx] text-[#1a0e0b] font-bold leading-[42rpx]">
                  {{ isLogin ? (item.prefix || '') + item.value : '-' }}
                </text>
                <text class="mt-[8rpx] block text-[21rpx] text-[#7a6560] leading-[26rpx]">
                  {{ item.label }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 服务分组列表 -->
      <view v-for="group in serviceGroups" :key="group.title" class="mt-[16rpx] rounded-[24rpx] bg-[#ffffff] px-[28rpx] py-[24rpx] shadow-[0_12rpx_34rpx_rgba(89,57,45,0.10)]">
        <!-- 分组标题 -->
        <view class="mb-[8rpx] flex items-center">
          <view class="text-[26rpx] leading-[34rpx]" :class="group.icon" :style="{ color: group.iconColor }" />
          <text class="ml-[10rpx] text-[26rpx] text-[#7a5147] leading-[34rpx] font-[700]">
            {{ group.title }}
          </text>
        </view>

        <!-- 分组菜单项 -->
        <view
          v-for="(item, index) in group.items"
          :key="item.title"
          class="h-[84rpx] flex items-center"
          @click="handleItemClick(item)"
        >
          <view class="h-[40rpx] w-[40rpx] flex flex-shrink-0 items-center justify-center rounded-[10rpx]" :style="{ backgroundColor: item.bg }">
            <view class="text-[22rpx] text-[#ffffff]" :class="item.icon" />
          </view>
          <view
            class="ml-[24rpx] h-[84rpx] min-w-[0rpx] flex flex-1 items-center border-[#f0e8e4]"
            :class="index === group.items.length - 1 ? '' : 'border-b-[1rpx] border-b-solid'"
          >
            <text class="text-[28rpx] text-[#1f1715] leading-[36rpx]">
              {{ item.title }}
            </text>
            <text v-if="item.badge" class="ml-[14rpx] rounded-[18rpx] bg-[rgb(254,137,115)] px-[14rpx] py-[4rpx] text-[18rpx] text-[#ffffff] leading-[22rpx]">
              {{ item.badge }}
            </text>
            <view class="ml-auto flex items-center gap-[8rpx]">
              <text v-if="item.extra" class="text-[24rpx] text-[rgb(254,137,115)] leading-[32rpx]">
                {{ item.extra }}
              </text>
              <view class="i-carbon-chevron-right text-[28rpx] text-[#c4b3ae]" />
            </view>
          </view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view
        v-if="isLogin"
        class="mt-[16rpx] h-[88rpx] flex items-center justify-center rounded-[24rpx] bg-[#ffffff] shadow-[0_12rpx_34rpx_rgba(89,57,45,0.10)]"
        @click="handleLogout"
      >
        <view class="i-carbon-logout mr-[10rpx] text-[28rpx] text-[#ff5b67]" />
        <text class="text-[28rpx] text-[#ff5b67] leading-[36rpx] font-[700]">
          退出登录
        </text>
      </view>
    </view>

    <!-- 使用须知弹窗 -->
    <view v-if="showNotice" class="fixed inset-[0rpx] z-[20] flex items-center justify-center bg-[rgba(44,30,25,0.28)] px-[60rpx]">
      <view class="max-h-[660rpx] w-[100%] rounded-[24rpx] bg-[#fffefa] px-[36rpx] py-[36rpx] shadow-[0_18rpx_58rpx_rgba(73,42,32,0.20)]">
        <text class="block text-center text-[34rpx] text-[#4a2b24] leading-[44rpx] font-[900]">
          使用须知
        </text>
        <view class="mt-[12rpx] flex items-center justify-center">
          <view class="h-[2rpx] w-[48rpx] bg-[#ffb099]" />
          <view class="i-carbon-favorite-filled mx-[16rpx] text-[22rpx] text-[rgb(254,137,115)]" />
          <view class="h-[2rpx] w-[48rpx] bg-[#ffb099]" />
        </view>
        <scroll-view scroll-y class="mt-[22rpx] max-h-[360rpx]" :show-scrollbar="true">
          <text class="block text-[25rpx] text-[#5b3f37] leading-[38rpx]">
            感谢你来到「帮你说出口」。在使用之前，请了解以下约定：
          </text>
          <view v-for="(item, index) in noticeList" :key="item" class="mt-[14rpx] flex">
            <text class="w-[40rpx] flex-shrink-0 text-[25rpx] text-[#7a5147] leading-[38rpx]">
              {{ index + 1 }}.
            </text>
            <text class="flex-1 text-[25rpx] text-[#5b3f37] leading-[38rpx]">
              {{ item }}
            </text>
          </view>
        </scroll-view>
        <button
          class="mt-[28rpx] h-[72rpx] w-[100%] border-[0rpx] rounded-[18rpx] bg-[rgb(254,137,115)] p-[0rpx] text-[30rpx] text-[#ffffff] leading-[72rpx]"
          @click="showNotice = false"
        >
          我已阅读并同意
        </button>
      </view>
    </view>
  </view>
</template>
