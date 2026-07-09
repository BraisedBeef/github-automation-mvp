import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileURLToPath } from 'node:url'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import viteCompression from 'vite-plugin-compression'
import svgLoader from 'vite-svg-loader'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { createHtmlPlugin } from 'vite-plugin-html'
import path from 'path'

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, './env', '')
  return defineConfig({
    envDir: 'env',
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: true,
      __INTLIFY_PROD_DEVTOOLS__: false,
    },
    plugins: [
      vue({
        template: {
          transformAssetUrls: {
            includeAbsolute: false,
          },
        },
      }),
      vueJsx(),
      createSvgIconsPlugin({
        iconDirs: [
          path.resolve(process.cwd(), 'src/assets/svg-icon'),
          path.resolve(process.cwd(), 'src/assets/v2/cvm/svg'),
          path.resolve(process.cwd(), 'src/assets/v2/home-figma/svg'),
          path.resolve(process.cwd(), 'src/assets/v2/cost/svg'),
        ],
        symbolId: 'icon-[name]',
      }),
      autoImport({
        imports: ['vue', 'vue-router'],
        dts: 'types/auto-import.d.ts',
        resolvers: [ElementPlusResolver()],
        eslintrc: {
          enabled: false, // 1、改为true用于生成eslint配置。2、生成后改回false，避免重复生成消耗
        },
      }),
      components({
        dts: 'types/components.d.ts',
        resolvers: [ElementPlusResolver()],
      }),
      viteCompression({
        threshold: 10240, // 超过10kb压缩
      }),
      createHtmlPlugin({
        inject: {
          data: {
            title: env.VITE_APP_TITLE,
            version: new Date().getTime(),
            favicon: env.VITE_APP_FAVICON,
          },
        },
      }),
      svgLoader({
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  // override svgo default config https://www.npmjs.com/package/svgo
                  removeViewBox: false,
                },
              },
            },
          ],
        },
      }),
    ],
    test: {
      globals: true,
      environment: 'happy-dom',
    },
    build: {
      outDir: 'dist',
      cssCodeSplit: true,
      cssTarget: 'es2015',
      minify: 'terser',
      chunkSizeWarningLimit: 600,
      reportCompressedSize: true,
      terserOptions: {
        compress: {
          // 生产环境移除console
          // drop_console: true,
          drop_console: !(mode === 'dev' || mode === 'test'),
          drop_debugger: !(mode === 'dev'),
        },
      },
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (!id.includes('node_modules')) return

            if (id.includes('/node_modules/echarts/') || id.includes('/node_modules/vue-echarts/')) {
              return 'echarts'
            }

            if (
              id.includes('/node_modules/@vue/') ||
              id.includes('/node_modules/vue/') ||
              id.includes('/node_modules/vue-router/') ||
              id.includes('/node_modules/pinia/') ||
              id.includes('/node_modules/element-plus/') ||
              id.includes('/node_modules/@element-plus/')
            ) {
              return 'vue-vendor'
            }

            return
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.vue', '.json'],
    },
    css: {
      devSourcemap: false,
      preprocessorOptions: {
        less: {
          modifyVars: {},
          javascriptEnabled: true,
        },
        scss: {
          additionalData: `@use "@/assets/styles/mixins.scss" as *;`,
        },
      },
    },
    server: {
      // 代理配置
      proxy: {
        // 有道翻译
        // '^/api/translate': {
        //   target: 'https://openapi.youdao.com/v2/api',
        //   rewrite: path => {
        //     return path.replace('/api/translate', '')
        //   },
        //   changeOrigin: true,
        // },
        // cdn接口
        '^/cdn': {
          target: 'http://192.168.5.254:8888',
          // rewrite: path => path.replace(/^\/bbb/, ""),
          rewrite: path => {
            //192.168.0.221:8888/cdn/statics/operators
            console.log('代理:', 'http://192.168.5.254:8888' + path)
            return path
          },
          changeOrigin: true,
        },
        '^/proxy_api': {
          target: 'http://vcloud-api-test.zshtys888.com',
          rewrite: path => {
            return path.replace('/proxy_api', '')
          },
          changeOrigin: true,
        },
        '^/ssl_cert': {
          target: 'http://123.207.71.75:12312/sslcert-console',
          // target: 'http://192.168.80.7:1141',
          rewrite: path => {
            return path.replace('/ssl_cert', '')
          },
          changeOrigin: true,
        },
        // hwyOBS
        '^/oss': {
          target: 'https://vcloud-test-api.acgxt.com',
          rewrite: path => {
            const p = path.replace('/oss', '')
            console.log('进代理', 'https://vcloud-test-api.acgxt.com' + p)
            return p
          },
          changeOrigin: true,
        },
      },
      host: '0.0.0.0',
      // host: '192.168.5.112',
      port: 1212,
    },
  })
}
