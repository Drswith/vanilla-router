/// <reference types="vitest" />
import path from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    dts(),
  ],
  server: {
    port: 5173,
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.{test,spec}.{js,ts}',
      ],
      all: true,
    },
    environment: 'jsdom',
  },
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'VanillaRouter',
      formats: ['es', 'cjs', 'iife'],
    },
  },
})
