import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // base: './',  <-- 이 줄은 삭제했습니다. (Vercel 배포 시 기본값 '/' 권장)
  server: {
    host: true,
    port: 5173,
  }
});