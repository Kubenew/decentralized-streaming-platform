import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@dsp/core': new URL('../core/src', import.meta.url).pathname,
    },
  },
})
