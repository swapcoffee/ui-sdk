import { fileURLToPath, URL } from 'node:url'
import { resolve, dirname } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite"
import { nodePolyfills } from 'vite-plugin-node-polyfills';


export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
        Buffer: 'globalThis.Buffer',
      },
    }
  },
  plugins: [
    vue(),
    nodePolyfills(),
    VueI18nPlugin({
      include: resolve(
          dirname(fileURLToPath(import.meta.url)),
          "./src/i18n/locales/**"
      )
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SwapWidgetSDK',
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'es') {
          return 'swap-sdk.esm.js';
        } else if (format === 'cjs') {
          return 'swap-sdk.cjs.js';
        } else {
          return `swap-sdk.${format}.js`;
        }
      }
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
