import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = {
    '/api': {
      target: env.API_PROXY_TARGET || 'https://goplan-tp2.onrender.com',
      changeOrigin: true,
      // Debe coincidir con APP_ORIGIN del backend remoto.
      headers: { origin: env.API_PROXY_ORIGIN || 'http://localhost:8080' },
      cookieDomainRewrite: '',
    },
  }

  return {
    plugins: [vue(), vueDevTools()],
    server: { proxy, headers: { 'Referrer-Policy': 'no-referrer-when-downgrade' } },
    preview: { proxy, headers: { 'Referrer-Policy': 'no-referrer-when-downgrade' } },
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
  }
})
