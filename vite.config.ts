import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'

import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    optimizeDeps: { exclude: [] },
    define: {
      __APP_ENV__: env.APP_ENV,
      APP_VERSION: JSON.stringify(process.env.npm_package_version)
    },
    build: {
      minify: 'esbuild',
      sourcemap: mode !== 'production',
      outDir: 'build',
      chunkSizeWarningLimit: 1600,
      commonjsOptions: { transformMixedEsModules: true },
      esbuild: {
        target: 'es2020',
        legalComments: 'none'
      }
    },
    server: {
      watch: {
        usePolling: true
      },
      host: true,
      strictPort: true,
      port: 8000,
      proxy: {
        '/api': env.PROXY_URL
      }
    },
    plugins: [
      react(),
      svgr(),
      tsconfigPaths(),
      nodePolyfills({ globals: { process: true } })
    ]
  }
})
