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
        secure: false,
        rewrite: (path) => path
      },
      '/jwt-auth': {
        target: 'http://flores.local',
        changeOrigin: true,
        secure: false
      },
      // Proxy para imágenes y archivos estáticos
      '/wp-content': {
        target: 'http://flores.local',
        changeOrigin: true,
        secure: false
      },
      // Proxy para la API de WooCommerce
      '/wc-api': {
        target: 'http://flores.local',
        changeOrigin: true,
        secure: false
      }
    },
    cors: {
      origin: '*',
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }
  }
})
