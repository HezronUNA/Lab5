// tracing.js - Distributed Tracing con OpenTelemetry
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import resourcePkg from '@opentelemetry/resources';
import semanticConventionsPkg from '@opentelemetry/semantic-conventions';
import logger from './logger.js';

const { Resource } = resourcePkg;
const { SemanticResourceAttributes } = semanticConventionsPkg;

/**
 * Inicializa OpenTelemetry para distributed tracing
 * Solo se activa si OTEL_EXPORTER_OTLP_ENDPOINT está configurado
 */
export function initTracing() {
  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  
  // Si no hay endpoint configurado, usar tracing simplificado
  if (!otlpEndpoint) {
    logger.info('ℹ️  OTEL_EXPORTER_OTLP_ENDPOINT no configurado. Tracing deshabilitado.');
    logger.info('💡 Para habilitar tracing, configura el endpoint OTLP (ej: Jaeger, Zipkin, etc.)');
    return null;
  }

  try {
    // Configurar exportador OTLP (compatible con Jaeger, Zipkin, etc.)
    const traceExporter = new OTLPTraceExporter({
      url: otlpEndpoint,
      headers: {
        // Agregar headers personalizados si es necesario
        // 'Authorization': `Bearer ${process.env.OTEL_API_KEY}`
      },
    });

    // Configurar resource con metadatos del servicio
    const resource = Resource.default().merge(
      new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'lab5-chat-server',
        [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
      })
    );

    // Inicializar SDK de OpenTelemetry
    const sdk = new NodeSDK({
      resource: resource,
      traceExporter: traceExporter,
      instrumentations: [
        // Auto-instrumentación para HTTP, Express, Socket.IO, etc.
        getNodeAutoInstrumentations({
          // Configuración de instrumentaciones
          '@opentelemetry/instrumentation-http': {
            // Agregar headers personalizados a spans
            requestHook: (span, request) => {
              span.setAttribute('http.user_agent', request.headers['user-agent'] || 'unknown');
            },
            // Ignorar endpoints de health check y métricas
            ignoreIncomingPaths: ['/health', '/metrics'],
          },
          '@opentelemetry/instrumentation-express': {
            requestHook: (span, requestInfo) => {
              // Agregar información del request al span
              span.setAttribute('express.route', requestInfo.route || 'unknown');
            },
          },
        }),
      ],
    });

    // Iniciar el SDK
    sdk.start();

    logger.info('✅ OpenTelemetry tracing inicializado correctamente');
    logger.info(`📡 Exportando traces a: ${otlpEndpoint}`);

    // Manejar shutdown gracefully
    process.on('SIGTERM', () => {
      sdk.shutdown()
        .then(() => logger.info('OpenTelemetry SDK apagado correctamente'))
        .catch((error) => logger.error('Error apagando OpenTelemetry SDK', error))
        .finally(() => process.exit(0));
    });

    return sdk;
  } catch (error) {
    logger.error(`❌ Error inicializando OpenTelemetry: ${error.message}`);
    return null;
  }
}

/**
 * Crear un span personalizado manualmente
 * Útil para trazar operaciones específicas fuera de auto-instrumentación
 * 
 * @param {string} name - Nombre del span
 * @param {Function} fn - Función a ejecutar dentro del span
 * @param {Object} attributes - Atributos opcionales del span
 */
export async function withSpan(name, fn, attributes = {}) {
  const { trace } = await import('@opentelemetry/api');
  const tracer = trace.getTracer('lab5-chat-server');
  
  return tracer.startActiveSpan(name, async (span) => {
    try {
      // Agregar atributos personalizados
      Object.entries(attributes).forEach(([key, value]) => {
        span.setAttribute(key, value);
      });
      
      // Ejecutar función
      const result = await fn();
      
      // Marcar como exitoso
      span.setStatus({ code: 1 }); // OK
      
      return result;
    } catch (error) {
      // Marcar como error
      span.setStatus({
        code: 2, // ERROR
        message: error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Agregar evento personalizado a un span activo
 * @param {string} name - Nombre del evento
 * @param {Object} attributes - Atributos del evento
 */
export async function addEvent(name, attributes = {}) {
  const { trace } = await import('@opentelemetry/api');
  const span = trace.getActiveSpan();
  
  if (span) {
    span.addEvent(name, attributes);
  }
}

export default {
  initTracing,
  withSpan,
  addEvent
};
