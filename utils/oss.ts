/**
 * 拼接 OSS 请求路径
 * @param path 图片相对路径，如 home/banner-1.png
 * @param name 可选的文件名，拼接在 path 之后
 * @returns 完整的图片 URL（OSS 开启时）或本地静态资源路径（OSS 关闭时）
 */
export function mergeOssPath(path: string, name?: string): string {
  const ossBase = import.meta.env.VITE_APP_OSS_URL
  const ossPath = import.meta.env.VITE_APP_OSS_PATH
  const originalPath = name ? `${path}/${name}` : `${path}`

  // OSS 开关为 off 时，回退到本地静态资源
  if (import.meta.env.VITE_APP_OSS_ON === 'off') {
    return getAssetsFile(originalPath)
  }

  if (!ossBase || !ossPath) {
    return getAssetsFile(originalPath)
  }

  return ossBase + ossPath + originalPath
}

/**
 * 获取本地静态资源路径（兼容根目录和子目录部署）
 */
function getAssetsFile(url: string): string {
  return `${import.meta.env.VITE_BASE_PATH ?? '/'}static/images/${url}`
}

/**
 * 获取 OSS 上的静态文件链接（如模板文件、Excel 等）
 * @param name 文件名，如 模板.xlsx
 * @returns 完整的 OSS 链接
 */
export function getTemplatePath(name: string): string {
  const ossBase = import.meta.env.VITE_APP_OSS_URL
  const ossPath = import.meta.env.VITE_APP_OSS_TEMPLATE_PATH
  return ossBase + ossPath + name
}
