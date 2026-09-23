import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './assets/styles/globals.css';
import { App } from './app/App';
import { ErrorBoundary } from './components/system/ErrorBoundary';

registerSW({ immediate: true });

const root = document.getElementById('root');

if (!root) {
  throw new Error('Elemento #root não encontrado.');
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
