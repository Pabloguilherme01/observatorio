import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/styles/globals.css';
import { App } from './app/App';
import { ErrorBoundary } from './components/system/ErrorBoundary';

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
