import { APP_VERSION } from '../config/version';

const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();

export const SENTRY_ENABLED = Boolean(dsn);

let sentryPromise: Promise<typeof import('@sentry/react')> | null = null;

if (dsn) {
  sentryPromise = import('@sentry/react').then(Sentry => {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      release: 'observatorio@' + APP_VERSION,
      integrations: [Sentry.browserTracingIntegration()],
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
      enabled: true,
    });
    return Sentry;
  });
}

export function captureObservatorioException(error: unknown, context?: Record<string, unknown>): void {
  if (!sentryPromise) return;
  void sentryPromise.then(Sentry => {
    Sentry.withScope(scope => {
      if (context) scope.setContext('observatorio', context);
      Sentry.captureException(error);
    });
  }).catch(() => {
    // Telemetria nunca deve bloquear a aplicação principal.
  });
}
