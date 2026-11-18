import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/katex/')) return 'katex'
          if (id.includes('/node_modules/highlight.js/')) return 'highlight'
          if (id.includes('/node_modules/markdown-it')) return 'markdown'
          if (id.includes('/node_modules/vue-virtual-scroller/')) return 'virtual-scroller'
        }
      }
    }
  }
})
