<script setup lang="ts">
import type { UserSetting } from '@/api/setting'
import { getDoc, getUserSetting, updateUserSetting } from '@/api/setting'
import { logoff } from '@/api/user'

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

// ---------- 用户设置 ----------
const setting = ref<UserSetting>({
  notifySendResult: 1,
  notifyReply: 1,
  notifyActivity: 1,
  defaultAnonymous: 1,
})

const loading = ref(false)

onShow(() => {
  if (userStore.isLogin)
    fetchSetting()
})

async function fetchSetting() {
  try {
    const data = await getUserSetting()
    setting.value = data
  }
  catch {}
}

async function onToggle(key: keyof UserSetting, val: boolean) {
  const numVal = val ? 1 : 0
  ;(setting.value as any)[key] = numVal
  try {
    await updateUserSetting({ [key]: numVal })
  }
  catch {
    // 回滚
    ;(setting.value as any)[key] = val ? 0 : 1
  }
}

// ---------- 文档弹窗 ----------
const docModal = ref({ visible: false, title: '', content: '' })
const docLoading = ref(false)

async function openDoc(key: string, fallbackTitle: string) {
  docModal.value = { visible: true, title: fallbackTitle, content: '' }
  docLoading.value = true
  try {
    const doc = await getDoc(key)
    docModal.value.title = doc.title
    docModal.value.content = doc.content
  }
  catch {
    docModal.value.content = '暂无内容'
  }
  finally {
    docLoading.value = false
  }
}

// ---------- 清除缓存 ----------
const cacheSize = ref('计算中...')

onMounted(() => {
  calcCache()
})

function calcCache() {
  // #ifndef H5
  try {
    const info = uni.getStorageInfoSync()
    const kb = info.currentSize || 0
    cacheSize.value = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
  }
  catch {
    cacheSize.value = '0 KB'
  }
  // #endif
  // #ifdef H5
  cacheSize.value = '< 1 MB'
  // #endif
}

function clearCache() {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除本地缓存吗？',
    success: (res) => {
      if (!res.confirm) return
      // #ifndef H5
      uni.clearStorageSync()
      // #endif
      // 重新初始化本地 token/userInfo
      const token = userStore.token
      if (token) uni.setStorageSync('token', token)
      cacheSize.value = '0 KB'
      uni.showToast({ title: '缓存已清除', icon: 'success' })
    },
  })
}

// ---------- 退出登录 ----------
function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    confirmColor: '#ff5b67',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'none' })
        setTimeout(() => {
          uni.navigateBack()
        }, 600)
      }
    },
  })
}

// ---------- 注销账号 ----------
loading.value = false

function handleLogoff() {
  uni.showModal({
    title: '注销账号',
    content: '账号注销后数据将无法恢复，确认注销吗？',
    confirmText: '确认注销',
    confirmColor: '#ff5b67',
    success: async (res) => {
      if (!res.confirm) return
      loading.value = true
      try {
        await logoff()
        userStore.logout()
        uni.showToast({ title: '账号已注销', icon: 'none' })
        setTimeout(() => {
          uni.navigateBack()
        }, 800)
      }
      catch {}
      finally {
        loading.value = false
      }
    },
  })
}

// ---------- 修改手机号 ----------
function goChangePhone() {
  uni.navigateTo({ url: '/pages/change-phone' })
}

// ---------- 实名认证 ----------
function goRealAuth() {
  uni.showToast({ title: '实名认证功能即将上线', icon: 'none' })
}

// ---------- 导航栏返回 ----------
function goBack() {
  uni.navigateBack()
}

// ---------- 版本号 ----------
const appVersion = ref('1.0.0')
// #ifndef H5
try {
  const info = uni.getSystemInfoSync() as any
  appVersion.value = info.appVersion || '1.0.0'
}
catch {}
// #endif
</script>

<template>
  <view class="min-h-[100vh] bg-[#f7f3f2]">
    <!-- #ifndef H5 -->
    <view :style="{ height: `${statusBarHeight}px` }" class="bg-[#fffaf9]" />
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <view class="h-[22rpx] bg-[#fffaf9]" />
    <!-- #endif -->

    <!-- 导航栏 -->
    <view class="sticky top-0 z-10 flex h-[88rpx] items-center bg-[#fffaf9] px-[28rpx] shadow-[0_2rpx_12rpx_rgba(89,57,45,0.06)]">
      <view class="h-[64rpx] w-[64rpx] flex items-center justify-center rounded-[64rpx]" @click="goBack">
        <view class="i-carbon-chevron-left text-[36rpx] text-[#4a2b24]" />
      </view>
      <text class="ml-[12rpx] text-[32rpx] text-[#1a0e0b] font-[700]">
        设置
      </text>
    </view>

    <scroll-view scroll-y class="px-[24rpx] pb-[40rpx]">
      <!-- 通知设置 -->
      <view class="mt-[24rpx]">
        <text class="mb-[12rpx] block pl-[8rpx] text-[24rpx] text-[#9e7e76]">
          通知设置
        </text>
        <view class="overflow-hidden rounded-[24rpx] bg-[#ffffff] shadow-[0_8rpx_24rpx_rgba(89,57,45,0.07)]">
          <view class="flex h-[100rpx] items-center justify-between border-b-[1rpx] border-b-solid border-b-[#f0e8e4] px-[32rpx]">
            <view class="flex items-center gap-[18rpx]">
              <view class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-[14rpx] bg-[#fff0f1]">
                <view class="i-carbon-checkmark-filled text-[26rpx] text-[#ff5b67]" />
              </view>
              <text class="text-[28rpx] text-[#1a0e0b]">发送结果通知</text>
            </view>
            <switch
              :checked="!!setting.notifySendResult"
              color="#fe8973"
              @change="(e) => onToggle('notifySendResult', e.detail.value)"
            />
          </view>
          <view class="flex h-[100rpx] items-center justify-between border-b-[1rpx] border-b-solid border-b-[#f0e8e4] px-[32rpx]">
            <view class="flex items-center gap-[18rpx]">
              <view class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-[14rpx] bg-[#f4eeff]">
                <view class="i-carbon-reply-filled text-[26rpx] text-[#8d68ee]" />
              </view>
              <text class="text-[28rpx] text-[#1a0e0b]">回复通知</text>
            </view>
            <switch
              :checked="!!setting.notifyReply"
              color="#fe8973"
              @change="(e) => onToggle('notifyReply', e.detail.value)"
            />
          </view>
          <view class="flex h-[100rpx] items-center justify-between px-[32rpx]">
            <view class="flex items-center gap-[18rpx]">
              <view class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-[14rpx] bg-[#fff6df]">
                <view class="i-carbon-notification-filled text-[26rpx] text-[#ffb833]" />
              </view>
              <text class="text-[28rpx] text-[#1a0e0b]">活动推送通知</text>
            </view>
            <switch
              :checked="!!setting.notifyActivity"
              color="#fe8973"
              @change="(e) => onToggle('notifyActivity', e.detail.value)"
            />
          </view>
        </view>
      </view>

      <!-- 隐私设置 -->
      <view class="mt-[24rpx]">
        <text class="mb-[12rpx] block pl-[8rpx] text-[24rpx] text-[#9e7e76]">
          隐私设置
        </text>
        <view class="overflow-hidden rounded-[24rpx] bg-[#ffffff] shadow-[0_8rpx_24rpx_rgba(89,57,45,0.07)]">
          <view class="flex h-[100rpx] items-center justify-between border-b-[1rpx] border-b-solid border-b-[#f0e8e4] px-[32rpx]">
            <view class="flex items-center gap-[18rpx]">
              <view class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-[14rpx] bg-[#e8f6ff]">
                <view class="i-carbon-user-avatar text-[26rpx] text-[#3f97f4]" />
              </view>
              <view>
                <text class="text-[28rpx] text-[#1a0e0b]">匿名发送默认开启</text>
                <text class="mt-[4rpx] block text-[22rpx] text-[#9e7e76]">发送时默认隐藏真实信息</text>
              </view>
            </view>
            <switch
              :checked="!!setting.defaultAnonymous"
              color="#fe8973"
              @change="(e) => onToggle('defaultAnonymous', e.detail.value)"
            />
          </view>
          <view
            class="flex h-[100rpx] items-center justify-between px-[32rpx]"
            @click="() => { /* #ifndef H5 */ uni.openAppAuthorizeSetting(); /* #endif */ }"
          >
            <view class="flex items-center gap-[18rpx]">
              <view class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-[14rpx] bg-[#e8f6ff]">
                <view class="i-carbon-phone text-[26rpx] text-[#3f97f4]" />
              </view>
              <text class="text-[28rpx] text-[#1a0e0b]">通讯录访问权限</text>
            </view>
            <view class="flex items-center gap-[8rpx]">
              <text class="text-[24rpx] text-[#c4b3ae]">前往系统设置</text>
              <view class="i-carbon-chevron-right text-[26rpx] text-[#c4b3ae]" />
            </view>
          </view>
        </view>
      </view>

      <!-- 账号设置 -->
      <view class="mt-[24rpx]">
        <text class="mb-[12rpx] block pl-[8rpx] text-[24rpx] text-[#9e7e76]">
          账号设置
        </text>
        <view class="overflow-hidden rounded-[24rpx] bg-[#ffffff] shadow-[0_8rpx_24rpx_rgba(89,57,45,0.07)]">
          <view
            class="flex h-[100rpx] items-center justify-between border-b-[1rpx] border-b-solid border-b-[#f0e8e4] px-[32rpx]"
            @click="goChangePhone"
          >
            <view class="flex items-center gap-[18rpx]">
              <view class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-[14rpx] bg-[#e8f6ff]">
                <view class="i-carbon-mobile text-[26rpx] text-[#3f97f4]" />
              </view>
              <text class="text-[28rpx] text-[#1a0e0b]">修改手机号</text>
            </view>
            <view class="i-carbon-chevron-right text-[26rpx] text-[#c4b3ae]" />
          </view>
          <view
            class="flex h-[100rpx] items-center justify-between border-b-[1rpx] border-b-solid border-b-[#f0e8e4] px-[32rpx]"
            @click="goRealAuth"
          >
            <view class="flex items-center gap-[18rpx]">
              <view class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-[14rpx] bg-[#edfff4]">
                <view class="i-carbon-certificate text-[26rpx] text-[#35c96d]" />
              </view>
              <text class="text-[28rpx] text-[#1a0e0b]">实名认证</text>
            </view>
            <view class="flex items-center gap-[8rpx]">
              <text class="text-[24rpx] text-[#c4b3ae]">未认证</text>
              <view class="i-carbon-chevron-right text-[26rpx] text-[#c4b3ae]" />
            </view>
          </view>
          <view
            class="flex h-[100rpx] items-center justify-between px-[32rpx]"
            @click="handleLogoff"
          >
            <view class="flex items-center gap-[18rpx]">
              <view class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-[14rpx] bg-[#fff0f1]">
                <view class="i-carbon-trash-can text-[26rpx] text-[#ff5b67]" />
              </view>
              <text class="text-[28rpx] text-[#ff5b67]">注销账号</text>
            </view>
            <view class="i-carbon-chevron-right text-[26rpx] text-[#c4b3ae]" />
          </view>
        </view>
      </view>

      <!-- 其他 -->
      <view class="mt-[24rpx]">
        <text class="mb-[12rpx] block pl-[8rpx] text-[24rpx] text-[#9e7e76]">
          其他
        </text>
        <view class="overflow-hidden rounded-[24rpx] bg-[#ffffff] shadow-[0_8rpx_24rpx_rgba(89,57,45,0.07)]">
          <view
            class="flex h-[100rpx] items-center justify-between border-b-[1rpx] border-b-solid border-b-[#f0e8e4] px-[32rpx]"
            @click="clearCache"
          >
            <view class="flex items-center gap-[18rpx]">
              <view class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-[14rpx] bg-[#fff6df]">
                <view class="i-carbon-clean text-[26rpx] text-[#ffb833]" />
              </view>
              <text class="text-[28rpx] text-[#1a0e0b]">清除缓存</text>
            </view>
            <view class="flex items-center gap-[8rpx]">
              <text class="text-[24rpx] text-[#c4b3ae]">{{ cacheSize }}</text>
              <view class="i-carbon-chevron-right text-[26rpx] text-[#c4b3ae]" />
            </view>
          </view>
          <view
            class="flex h-[100rpx] items-center justify-between border-b-[1rpx] border-b-solid border-b-[#f0e8e4] px-[32rpx]"
            @click="openDoc('user_agreement', '用户协议')"
          >
            <view class="flex items-center gap-[18rpx]">
              <view class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-[14rpx] bg-[#f4eeff]">
                <view class="i-carbon-document text-[26rpx] text-[#8d68ee]" />
              </view>
              <text class="text-[28rpx] text-[#1a0e0b]">用户协议</text>
            </view>
            <view class="i-carbon-chevron-right text-[26rpx] text-[#c4b3ae]" />
          </view>
          <view
            class="flex h-[100rpx] items-center justify-between border-b-[1rpx] border-b-solid border-b-[#f0e8e4] px-[32rpx]"
            @click="openDoc('privacy_policy', '隐私政策')"
          >
            <view class="flex items-center gap-[18rpx]">
              <view class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-[14rpx] bg-[#f4eeff]">
                <view class="i-carbon-security text-[26rpx] text-[#8d68ee]" />
              </view>
              <text class="text-[28rpx] text-[#1a0e0b]">隐私政策</text>
            </view>
            <view class="i-carbon-chevron-right text-[26rpx] text-[#c4b3ae]" />
          </view>
          <view
            class="flex h-[100rpx] items-center justify-between border-b-[1rpx] border-b-solid border-b-[#f0e8e4] px-[32rpx]"
            @click="openDoc('usage_guide', '使用须知')"
          >
            <view class="flex items-center gap-[18rpx]">
              <view class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-[14rpx] bg-[#fff6df]">
                <view class="i-carbon-warning-alt text-[26rpx] text-[#ffb833]" />
              </view>
              <text class="text-[28rpx] text-[#1a0e0b]">使用须知</text>
            </view>
            <view class="i-carbon-chevron-right text-[26rpx] text-[#c4b3ae]" />
          </view>
          <view class="flex h-[100rpx] items-center justify-between px-[32rpx]">
            <view class="flex items-center gap-[18rpx]">
              <view class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-[14rpx] bg-[#e8f6ff]">
                <view class="i-carbon-information text-[26rpx] text-[#3f97f4]" />
              </view>
              <text class="text-[28rpx] text-[#1a0e0b]">当前版本</text>
            </view>
            <text class="text-[24rpx] text-[#c4b3ae]">v{{ appVersion }}</text>
          </view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view
        v-if="userStore.isLogin"
        class="mt-[32rpx] h-[96rpx] flex items-center justify-center rounded-[24rpx] bg-[#ffffff] shadow-[0_8rpx_24rpx_rgba(89,57,45,0.07)]"
        @click="handleLogout"
      >
        <view class="i-carbon-logout mr-[14rpx] text-[30rpx] text-[#ff5b67]" />
        <text class="text-[30rpx] text-[#ff5b67] font-[700]">退出登录</text>
      </view>

      <view class="h-[60rpx]" />
    </scroll-view>

    <!-- 文档弹窗 -->
    <view
      v-if="docModal.visible"
      class="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(44,30,25,0.32)]"
      @click.self="docModal.visible = false"
    >
      <view class="h-[82vh] w-[100%] overflow-hidden rounded-t-[32rpx] bg-[#fffefa]">
        <!-- 弹窗头部 -->
        <view class="flex h-[96rpx] items-center justify-between border-b-[1rpx] border-b-solid border-b-[#f0e8e4] px-[36rpx]">
          <text class="text-[32rpx] text-[#1a0e0b] font-[700]">{{ docModal.title }}</text>
          <view
            class="h-[56rpx] w-[56rpx] flex items-center justify-center rounded-[56rpx] bg-[#f5eeec]"
            @click="docModal.visible = false"
          >
            <view class="i-carbon-close text-[28rpx] text-[#7a5147]" />
          </view>
        </view>
        <!-- 内容 -->
        <scroll-view scroll-y class="h-[calc(82vh-96rpx)] px-[36rpx] py-[28rpx]">
          <view v-if="docLoading" class="flex items-center justify-center py-[80rpx]">
            <text class="text-[28rpx] text-[#c4b3ae]">加载中...</text>
          </view>
          <rich-text v-else :nodes="docModal.content" class="text-[28rpx] text-[#4a2b24] leading-[52rpx]" />
        </scroll-view>
      </view>
    </view>
  </view>
</template>
