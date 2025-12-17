import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath } from 'node:url'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import svgLoader from 'vite-svg-loader'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vuetify(),
    svgLoader(),
    VueDevTools(),
    Components({
      dirs: ['src/components', 'src/views/components', 'src/core/components'],
      dts: true,
      resolvers: [
        componentName => {
          if (componentName === 'VueApexCharts')
            return { name: 'default', from: 'vue3-apexcharts', as: 'VueApexCharts' }
        },
      ],
    }),
    AutoImport({
      imports: [
        'vue',
        VueRouterAutoImports,
        '@vueuse/core',
        '@vueuse/math',
        'vue-i18n',
        'pinia',
      ],
      dirs: [
        './src/composable/**',
        './src/utils/**',
      ],
      dts: true,
      vueTemplate: true,
      ignore: [
        'useCookie', 
        'useStorage',
      ],
    }),
  ],
   
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/@core', import.meta.url)),
      '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/assets/styles', import.meta.url)),
      '@themeConfig': fileURLToPath(new URL('./themeConfig.ts', import.meta.url)),
      '@theme-variables': fileURLToPath(new URL('./src/assets/styles/variables/_template.scss', import.meta.url)),
    },
  },
  server: {
    host: 'portal.droneguru.local',
    port: 3000,
  },

  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vuetify'))
              return 'vendor-vuetify'

            if (id.includes('vue-router') || id.includes('pinia') || id.includes('/vue/'))
              return 'vendor-vue'

            if (id.includes('apexcharts') || id.includes('vue3-apexcharts'))
              return 'vendor-apexcharts'

            if (id.includes('quill') || id.includes('@vueup/vue-quill'))
              return 'vendor-quill'
          }
        },
      },
    },
  },
})
