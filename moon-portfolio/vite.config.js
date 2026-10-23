import { defineConfig } from 'vite';

export default defineConfig({
  // 相对路径，打包后可直接用任意静态服务器托管（也能直接开 index.html 预览）
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2018',
    cssCodeSplit: false
  }
});