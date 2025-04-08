// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { resolve, dirname } from "node:path";
import { defineConfig } from "file:///E:/projects/work/ui-sdk/node_modules/vite/dist/node/index.js";
import vue from "file:///E:/projects/work/ui-sdk/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import VueI18nPlugin from "file:///E:/projects/work/ui-sdk/node_modules/@intlify/unplugin-vue-i18n/lib/vite.mjs";
import { nodePolyfills } from "file:///E:/projects/work/ui-sdk/node_modules/vite-plugin-node-polyfills/dist/index.js";
import cssInjectedByJsPlugin from "file:///E:/projects/work/ui-sdk/node_modules/vite-plugin-css-injected-by-js/dist/esm/index.js";
var __vite_injected_original_dirname = "E:\\projects\\work\\ui-sdk";
var __vite_injected_original_import_meta_url = "file:///E:/projects/work/ui-sdk/vite.config.ts";
var vite_config_default = defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
        Buffer: "globalThis.Buffer"
      }
    }
  },
  plugins: [
    vue(),
    nodePolyfills(),
    VueI18nPlugin({
      include: resolve(
        dirname(fileURLToPath(__vite_injected_original_import_meta_url)),
        "./src/i18n/locales/**"
      )
    }),
    cssInjectedByJsPlugin()
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/main.ts"),
      name: "SwapWidgetSDK",
      formats: ["es", "cjs"],
      fileName: (format) => {
        if (format === "es") {
          return "swap-sdk.esm.js";
        } else if (format === "cjs") {
          return "swap-sdk.cjs.js";
        } else if (format === "umd") {
          return "swap-sdk.umd.js";
        } else {
          return `swap-sdk.${format}.js`;
        }
      }
    }
    // rollupOptions: {
    //   external: ['vue'],
    //   output: {
    //     globals: {
    //       vue: 'Vue'
    //     }
    //   }
    // }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxwcm9qZWN0c1xcXFx3b3JrXFxcXHVpLXNka1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxccHJvamVjdHNcXFxcd29ya1xcXFx1aS1zZGtcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L3Byb2plY3RzL3dvcmsvdWktc2RrL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXHJcbmltcG9ydCB7IHJlc29sdmUsIGRpcm5hbWUgfSBmcm9tICdub2RlOnBhdGgnXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xyXG5pbXBvcnQgVnVlSTE4blBsdWdpbiBmcm9tIFwiQGludGxpZnkvdW5wbHVnaW4tdnVlLWkxOG4vdml0ZVwiXHJcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscyc7XHJcbmltcG9ydCBjc3NJbmplY3RlZEJ5SnNQbHVnaW4gZnJvbSBcInZpdGUtcGx1Z2luLWNzcy1pbmplY3RlZC1ieS1qc1wiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBlc2J1aWxkT3B0aW9uczoge1xyXG4gICAgICBkZWZpbmU6IHtcclxuICAgICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcclxuICAgICAgICBCdWZmZXI6ICdnbG9iYWxUaGlzLkJ1ZmZlcicsXHJcbiAgICAgIH0sXHJcbiAgICB9XHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICB2dWUoKSxcclxuICAgIG5vZGVQb2x5ZmlsbHMoKSxcclxuICAgIFZ1ZUkxOG5QbHVnaW4oe1xyXG4gICAgICBpbmNsdWRlOiByZXNvbHZlKFxyXG4gICAgICAgICAgZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAgICAgXCIuL3NyYy9pMThuL2xvY2FsZXMvKipcIlxyXG4gICAgICApXHJcbiAgICB9KSxcclxuICAgIGNzc0luamVjdGVkQnlKc1BsdWdpbigpLFxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSlcclxuICAgIH1cclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBsaWI6IHtcclxuICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL21haW4udHMnKSxcclxuICAgICAgbmFtZTogJ1N3YXBXaWRnZXRTREsnLFxyXG4gICAgICBmb3JtYXRzOiBbJ2VzJywgJ2NqcyddLFxyXG4gICAgICBmaWxlTmFtZTogKGZvcm1hdCkgPT4ge1xyXG4gICAgICAgIGlmIChmb3JtYXQgPT09ICdlcycpIHtcclxuICAgICAgICAgIHJldHVybiAnc3dhcC1zZGsuZXNtLmpzJztcclxuICAgICAgICB9IGVsc2UgaWYgKGZvcm1hdCA9PT0gJ2NqcycpIHtcclxuICAgICAgICAgIHJldHVybiAnc3dhcC1zZGsuY2pzLmpzJztcclxuICAgICAgICB9IGVsc2UgaWYgKGZvcm1hdCA9PT0gJ3VtZCcpIHtcclxuICAgICAgICAgIHJldHVybiAnc3dhcC1zZGsudW1kLmpzJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIGBzd2FwLXNkay4ke2Zvcm1hdH0uanNgO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgIC8vICAgZXh0ZXJuYWw6IFsndnVlJ10sXHJcbiAgICAvLyAgIG91dHB1dDoge1xyXG4gICAgLy8gICAgIGdsb2JhbHM6IHtcclxuICAgIC8vICAgICAgIHZ1ZTogJ1Z1ZSdcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyAgIH1cclxuICAgIC8vIH1cclxuICB9XHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1AsU0FBUyxlQUFlLFdBQVc7QUFDbFMsU0FBUyxTQUFTLGVBQWU7QUFDakMsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sbUJBQW1CO0FBQzFCLFNBQVMscUJBQXFCO0FBQzlCLE9BQU8sMkJBQTJCO0FBTmxDLElBQU0sbUNBQW1DO0FBQW9ILElBQU0sMkNBQTJDO0FBUzlNLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLGNBQWM7QUFBQSxJQUNaLGdCQUFnQjtBQUFBLE1BQ2QsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLElBQ0osY0FBYztBQUFBLElBQ2QsY0FBYztBQUFBLE1BQ1osU0FBUztBQUFBLFFBQ0wsUUFBUSxjQUFjLHdDQUFlLENBQUM7QUFBQSxRQUN0QztBQUFBLE1BQ0o7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELHNCQUFzQjtBQUFBLEVBQ3hCO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBLE1BQ0gsT0FBTyxRQUFRLGtDQUFXLGFBQWE7QUFBQSxNQUN2QyxNQUFNO0FBQUEsTUFDTixTQUFTLENBQUMsTUFBTSxLQUFLO0FBQUEsTUFDckIsVUFBVSxDQUFDLFdBQVc7QUFDcEIsWUFBSSxXQUFXLE1BQU07QUFDbkIsaUJBQU87QUFBQSxRQUNULFdBQVcsV0FBVyxPQUFPO0FBQzNCLGlCQUFPO0FBQUEsUUFDVCxXQUFXLFdBQVcsT0FBTztBQUMzQixpQkFBTztBQUFBLFFBQ1QsT0FBTztBQUNMLGlCQUFPLFlBQVksTUFBTTtBQUFBLFFBQzNCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFTRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
