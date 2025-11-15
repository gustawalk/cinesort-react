import { defineConfig, loadEnv, type ConfigEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default ({ mode }: ConfigEnv) => {
  // Carrega as variáveis do .env do frontend
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  console.log(env.VITE_API_URL)

  return defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false
        }
      }
    }
  })
}

