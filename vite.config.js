import path from 'node:path'
// import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    // visualizer({
    //   open: true, // 注意这里要设置为true，否则无效
    //   filename: 'stats.html', // 分析图生成的文件名
    //   gzipSize: true, // 收集 gzip 大小并将其显示
    //   brotliSize: true, // 收集 brotli 大小并将其显示
    // }),
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
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    environment: 'jsdom',
  },
  build: {
    // minify: 'terser',
    lib: {
      entry: './src/index.ts',
      name: 'VanillaRouter',
      formats: ['es', 'cjs', 'iife'],
    },
  },
})
