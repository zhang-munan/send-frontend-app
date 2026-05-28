import { presetUni } from '@uni-helper/unocss-preset-uni'
import {
  defineConfig,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUni({
      attributify: {
        ignoreAttributes: ['color', 'scale', 'size'],
      },
    }),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
      // HBuilderX 必须针对要使用的 Collections 做异步导入
      // collections: {
      //   carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
      // },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  shortcuts: {
    // 一级字体颜色 #fe6a5a
    'text-primary': 'text-#fe6a5a',
    // 一级字体颜色 #262626
    'text-regular': 'text-#262626',
    // 二级字体颜色 #595959
    'text-secondary': 'text-#595959',
    // 三级字体颜色 #8c8c8c
    'text-tertiary': 'text-#8c8c8c',
    // 占位字体颜色 #bfbfbf
    'text-placeholder': 'text-#bfbfbf',
    // 主背景色
    'bg-primary': 'bg-#fe6a5a',
    // 卡片阴影
    'shadow-card': 'shadow-[0_2px_4px_0_#00000017]',
  },
})
