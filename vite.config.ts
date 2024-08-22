import { fileURLToPath, URL } from 'node:url'
import { resolve, dirname } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite"
// import NodeGlobalsPolyfillPlugin from "@esbuild-plugins/node-globals-polyfill";
import { nodePolyfills } from 'vite-plugin-node-polyfills';


// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
        Buffer: 'globalThis.Buffer',
      },
      // plugins: [
      //   NodeGlobalsPolyfillPlugin({
      //     buffer: true,
      //   })
      // ]
    }
  },
  plugins: [
    vue(),
    // NodeGlobalsPolyfillPlugin({
    //   buffer: true,
    // }),
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
  }
})
