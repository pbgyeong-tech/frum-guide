import React from 'react';
import ReactDOM from 'react-dom/client';
// importmap이 Router 7을 가져오므로 호환성을 위해 HashRouter 사용 권장
import { HashRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

// React 19 방식의 렌더링
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </HelmetProvider>
  </React.StrictMode>
);