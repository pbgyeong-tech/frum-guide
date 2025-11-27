import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DataProvider } from './context/DataContext'; // 이 부분이 추가되었습니다

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <DataProvider> {/* 앱을 데이터 공급자로 감쌉니다 */}
      <App />
    </DataProvider>
  </React.StrictMode>
);