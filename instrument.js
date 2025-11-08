import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Inicializa Sentry lo más temprano posible
Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  environment: process.env.NODE_ENV || "development",
  integrations: [
    nodeProfilingIntegration(),
    // Captura console.log/warn/error como logs en Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  // Logs estructurados a Sentry
  enableLogs: true,
  // Tracing
  tracesSampleRate: 1.0,
  // Profiling
  profileSessionSampleRate: 1.0,
  profileLifecycle: 'trace',
  // PII (revisar privacidad)
  sendDefaultPii: true,
});

export { Sentry };
