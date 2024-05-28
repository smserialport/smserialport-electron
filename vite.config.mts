import path from 'path'
import vue from '@vitejs/plugin-vue'
import unocss from 'unocss/vite'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'

/**
 * https://vitejs.dev/config
 */
export default defineConfig({
  root: path.join(__dirname, 'src', 'renderer'),
  publicDir: 'public',
  server: {
    port: 8080
  },
  build: {
    outDir: path.join(__dirname, 'build', 'renderer'),
    emptyOutDir: true
  },
  plugins: [
    vue(),
    unocss(),
    autoImport({
      imports: [
        'vue',
        'vue-router',
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar'
          ]
        }
      ],
      dts: fileURLToPath(
        new URL('.auto-import/auto-imports.d.ts', import.meta.url)
      )
    }),
    components({
      resolvers: [NaiveUiResolver()],
      dts: fileURLToPath(
        new URL('.auto-import/components.d.ts', import.meta.url)
      )
    })
  ]
})
