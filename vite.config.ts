import { fileURLToPath, URL } from 'node:url'
import { resolve, dirname } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite"
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";


export default defineConfig(({ mode }) => {
  const isWeb = mode === 'web';

  return {
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
          Buffer: 'globalThis.Buffer',
        },
      }
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: tag => tag.startsWith('swap-widget')
          }
        },
        customElement: isWeb // Используем режим customElement только для web-компонента
      }),
      nodePolyfills(),
      VueI18nPlugin({
        include: resolve(
            dirname(fileURLToPath(import.meta.url)),
            "./src/i18n/locales/**"
        )
      }),
      cssInjectedByJsPlugin(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      cssCodeSplit: false,
      outDir: isWeb ? 'dist/web' : 'dist/vue', // Разные выходные папки
      lib: {
        entry: resolve(__dirname, isWeb ? 'src/web/main.ts' : 'src/vue/main.ts'),
        name: 'SwapWidgetSDK',
        formats: ['es', 'cjs'],
        fileName: (format) => {
          if (format === 'es') {
            return `swap-coffee-sdk.esm.js`
          } else if (format === 'cjs') {
            return `swap-coffee-sdk.cjs.js`
          } else if (format === 'umd') {
            return `swap-coffee-sdk.umd.js`
          } else {
            return `swap-coffee-sdk.${format}.js`
          }
        }
      },
      // rollupOptions: {
      //   external: isWeb ? [] : ['vue'],
      //   output: {
      //     globals: isWeb ? {} : {vue: 'Vue'}
      //   }
      // }
    }
  }
});