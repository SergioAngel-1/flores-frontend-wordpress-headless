import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/wp-json': {
        target: 'http://flores.local',
        changeOrigin: true,
        secure: false
      },
      '/jwt-auth': {
        target: 'http://flores.local',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
