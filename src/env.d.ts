/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** H5 部署根路径，如 / 或 /h5/ */
  readonly VITE_BASE_PATH: string
  /** OSS 开关：on | off */
  readonly VITE_APP_OSS_ON: 'on' | 'off'
  /** OSS 基础域名，如 https://cdn.example.com */
  readonly VITE_APP_OSS_URL: string
  /** OSS 图片路径前缀，如 /bangni/images/ */
  readonly VITE_APP_OSS_PATH: string
  /** OSS 模板文件路径前缀，如 /bangni/templates/ */
  readonly VITE_APP_OSS_TEMPLATE_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
