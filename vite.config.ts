import { defineConfig } from 'vite'

/**
 * Proxy configurado para redirigir peticiones /api/* al backend Spring Boot.
 * Cuando el frontend escribe fetch('/api/...'), el proxy reescribe la URL
 * y la envía a http://localhost:8080/api/...
 * Esto evita problemas de CORS en desarrollo.
 */
const apiProxy = {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
}

export default defineConfig({
  server: {
    proxy: apiProxy,
  },
  preview: {
    proxy: apiProxy,
  },
})
