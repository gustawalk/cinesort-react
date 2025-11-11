import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { spawn } from 'child_process' //

// https://vite.dev/config/

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools({
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@texts': fileURLToPath(new URL('./src/textAnimations', import.meta.url)),
      '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:6700',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
