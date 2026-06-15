import * as Pinia from 'pinia'
import { createSSRApp } from 'vue'
import App from './App.vue'
import 'uno.css'

export function createApp() {
  const app = createSSRApp(App)
  app.use(Pinia.createPinia())
  return {
    app,
    // uni-app 要求将 Pinia 实例返回，否则在小程序端无法正常使用
    Pinia,
  }
}
