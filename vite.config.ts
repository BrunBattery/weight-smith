import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'fs'
import { resolve } from 'path'

// Check if full DesignReview exists (gitignored, local dev only)
const designReviewDevPath = resolve(__dirname, 'src/DesignReview.dev.tsx')
const designReviewExists = existsSync(designReviewDevPath)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      // Auto-resolve DesignReview to dev version if it exists, otherwise stub
      '@/DesignReview': designReviewExists
        ? resolve(__dirname, 'src/DesignReview.dev.tsx')
        : resolve(__dirname, 'src/DesignReview.stub.tsx'),
    },
  },
})

