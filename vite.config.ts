import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // BrowserRouter를 사용할 때는 절대 경로 '/'가 권장됩니다.
  // './'를 사용하면 /welcome 등 하위 경로에서 리소스를 찾지 못할 수 있습니다.
  base: '/', 
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
  }
});