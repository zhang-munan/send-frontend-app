import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  pages: [],
  globalStyle: {
    backgroundColor: '@bgColor',
    backgroundColorBottom: '@bgColorBottom',
    backgroundColorTop: '@bgColorTop',
    backgroundTextStyle: '@bgTxtStyle',
    navigationBarBackgroundColor: '#000000',
    navigationBarTextStyle: '@navTxtStyle',
    navigationBarTitleText: '帮你说出口',
    navigationStyle: 'custom',
  },
  tabBar: {
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    color: '#7d6d68',
    selectedColor: '#fe8973',
    list: [
      {
        pagePath: 'pages/index',
        text: '首页',
        iconPath: 'static/images/tabbar/home-line.png',
        selectedIconPath: 'static/images/tabbar/home.png',
      },
      {
        pagePath: 'pages/send',
        text: '发送',
        iconPath: 'static/images/tabbar/send-line.png',
        selectedIconPath: 'static/images/tabbar/send.png',
      },
      {
        pagePath: 'pages/template',
        text: '模板',
        iconPath: 'static/images/tabbar/temp-line.png',
        selectedIconPath: 'static/images/tabbar/temp.png',
      },
      {
        pagePath: 'pages/message',
        text: '消息',
        iconPath: 'static/images/tabbar/msg-line.png',
        selectedIconPath: 'static/images/tabbar/msg.png',
      },
      {
        pagePath: 'pages/mine',
        text: '我的',
        iconPath: 'static/images/tabbar/user-line.png',
        selectedIconPath: 'static/images/tabbar/user.png',
      },
    ],
  },
})
