import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import WindiCSS from 'vite-plugin-windicss'

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },
  plugins: [vue(), WindiCSS()],
})
