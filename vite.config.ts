import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 시스템이 강제로 넣는 importmap을 빌드/실행 시점에 제거하는 플러그인
const removeSystemImportMap = () => ({
  name: 'remove-system-import-map',
  transformIndexHtml(html) {
    return html.replace(/<script type="importmap">[\s\S]*?<\/script>/, '');
  },
});

export default defineConfig({
  plugins: [react(), removeSystemImportMap()],
  base: './', 
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
  }
});