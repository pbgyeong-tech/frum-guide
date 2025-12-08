import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: false, // 보안 검사 끄기
    hmr: {
      clientPort: 443 // 클라우드 환경에서 HMR 연결 문제 해결
    }
  }
});