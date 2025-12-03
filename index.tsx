import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // css 파일이 있다면 유지, 없으면 삭제
// 1. BrowserRouter 대신 HashRouter를 가져옵니다.
import { HashRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. BrowserRouter를 HashRouter로 교체 */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);