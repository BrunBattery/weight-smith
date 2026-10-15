import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Check if full DesignReview exists (gitignored, local dev only)
const designReviewDevPath = resolve(import.meta.dirname, 'src/DesignReview.dev.tsx')
const designReviewExists = existsSync(designReviewDevPath)

// Single source of truth for app version
const pkg = JSON.parse(readFileSync(resolve(import.meta.dirname, 'package.json'), 'utf-8'))
const APP_VERSION: string = pkg.version

// Substitute __APP_VERSION__ placeholder in public/sw.js at build time
// and serve a substituted version during dev.
function swVersionPlugin(): Plugin {
  const swPath = resolve(import.meta.dirname, 'public/sw.js')
  const substitute = (src: string) => src.replace(/__APP_VERSION__/g, APP_VERSION)
  return {
    name: 'sw-version-substitute',
    configureServer(server) {
      server.middlewares.use('/sw.js', (_req, res, next) => {
        try {
          const src = readFileSync(swPath, 'utf-8')
          res.setHeader('Content-Type', 'application/javascript')
          res.end(substitute(src))
        } catch {
          next()
        }
      })
    },
    closeBundle() {
      const outPath = resolve(import.meta.dirname, 'dist/sw.js')
      if (existsSync(outPath)) {
        writeFileSync(outPath, substitute(readFileSync(outPath, 'utf-8')))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), swVersionPlugin()],
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
  },
  resolve: {
    alias: {
      // Auto-resolve DesignReview to dev version if it exists, otherwise stub
      '@/DesignReview': designReviewExists
        ? resolve(import.meta.dirname, 'src/DesignReview.dev.tsx')
        : resolve(import.meta.dirname, 'src/DesignReview.stub.tsx'),
    },
  },
})

