import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './assets/styles/globals.css';
import { App } from './app/App';
import { ErrorBoundary } from './components/system/ErrorBoundary';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('observatorio:pwa-update-available'));
  },
});

function PwaStatus() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const onUpdate = () => setUpdateAvailable(true);
    window.addEventListener('observatorio:pwa-update-available', onUpdate);
    return () => window.removeEventListener('observatorio:pwa-update-available', onUpdate);
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="pwa-update-banner" role="status" aria-live="polite">
      <span>Há uma versão mais recente do Observatório.</span>
      <button type="button" onClick={() => void updateSW(true)} className="pwa-update-button">
        Atualizar
      </button>
    </div>
  );
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Elemento #root não encontrado.');
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <PwaStatus />
    </ErrorBoundary>
  </StrictMode>,
);
