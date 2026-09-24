import * as Sentry from '@sentry/react';
import { APP_VERSION } from '../config/version';

const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();

export const SENTRY_ENABLED = Boolean(dsn);

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: 'observatorio@' + APP_VERSION,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    enabled: true,
  });
}

export function captureObservatorioException(error: unknown, context?: Record<string, unknown>): void {
  if (!SENTRY_ENABLED) return;
  Sentry.withScope(scope => {
    if (context) scope.setContext('observatorio', context);
    Sentry.captureException(error);
  });
}
