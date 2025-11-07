// metrics.js - Sistema de métricas con Prometheus (prom-client)
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import logger from './logger.js';

// Habilitar métricas por defecto del sistema (CPU, memoria, etc.)
collectDefaultMetrics({
  prefix: 'nodejs_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5], // Buckets para GC
  eventLoopMonitoringPrecision: 10, // Precisión del event loop en ms
});

// ========================================
// MÉTRICAS PERSONALIZADAS
// ========================================

/**
 * Contador: Total de requests HTTP por método, ruta y código de estado
 * Ejemplo: http_requests_total{method="GET", route="/", status="200"} 45
 */
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total de requests HTTP recibidos',
  labelNames: ['method', 'route', 'status']
});

/**
 * Histograma: Duración de requests HTTP en milisegundos
 * Permite calcular percentiles (p50, p95, p99) y tasas de requests
 */
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Duración de requests HTTP en milisegundos',
  labelNames: ['method', 'route', 'status'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000] // Buckets en ms
});

/**
 * Contador: Total de conexiones de Socket.IO
 */
export const socketConnectionsTotal = new Counter({
  name: 'socket_connections_total',
  help: 'Total de conexiones de Socket.IO',
  labelNames: ['event']
});

/**
 * Contador: Total de mensajes de chat procesados
 */
export const chatMessagesTotal = new Counter({
  name: 'chat_messages_total',
  help: 'Total de mensajes de chat procesados',
  labelNames: ['validated']
});

/**
 * Contador: Total de errores por tipo
 */
export const errorsTotal = new Counter({
  name: 'errors_total',
  help: 'Total de errores por tipo',
  labelNames: ['type', 'endpoint']
});

// ========================================
// MIDDLEWARE DE MÉTRICAS
// ========================================

/**
 * Middleware de Express para capturar métricas automáticamente
 */
export function metricsMiddleware(req, res, next) {
  const start = Date.now();
  
  // Capturar cuando termine la respuesta
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    
    // Incrementar contador de requests
    httpRequestsTotal.inc({
      method: req.method,
      route: route,
      status: res.statusCode
    });
    
    // Registrar duración del request
    httpRequestDuration.observe(
      {
        method: req.method,
        route: route,
        status: res.statusCode
      },
      duration
    );
    
    // Si es un error, registrarlo
    if (res.statusCode >= 400) {
      errorsTotal.inc({
        type: res.statusCode >= 500 ? 'server_error' : 'client_error',
        endpoint: route
      });
    }
  });
  
  next();
}

/**
 * Endpoint handler para /metrics
 * Retorna todas las métricas en formato Prometheus
 */
export async function metricsHandler(req, res) {
  try {
    // Establecer content-type apropiado para Prometheus
    res.setHeader('Content-Type', register.contentType);
    
    // Obtener todas las métricas en formato texto
    const metrics = await register.metrics();
    
    res.send(metrics);
    
    logger.info('Métricas exportadas exitosamente');
  } catch (error) {
    logger.error(`Error exportando métricas: ${error.message}`);
    res.status(500).send('Error al exportar métricas');
  }
}

/**
 * Obtener resumen de métricas en formato JSON (para debugging)
 */
export async function getMetricsSummary() {
  const metrics = await register.getMetricsAsJSON();
  return metrics;
}

/**
 * Resetear todas las métricas (útil para testing)
 */
export function resetMetrics() {
  register.resetMetrics();
  logger.info('Métricas reseteadas');
}

logger.info('✅ Sistema de métricas Prometheus inicializado');

export default {
  metricsMiddleware,
  metricsHandler,
  httpRequestsTotal,
  httpRequestDuration,
  socketConnectionsTotal,
  chatMessagesTotal,
  errorsTotal,
  getMetricsSummary,
  resetMetrics
};
