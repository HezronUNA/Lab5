import * as Sentry from "@sentry/node";

// Inicializa Sentry lo más temprano posible
Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  environment: process.env.NODE_ENV || "development",
  // Ajusta estas tasas en producción
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
});

export { Sentry };
