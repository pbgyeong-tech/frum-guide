import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ▼▼▼ 이 설정이 없으면 검은 화면이 뜹니다 (상대 경로) ▼▼▼
  base: './', 
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
  }
});