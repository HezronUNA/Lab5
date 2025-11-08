// ========================================
// SISTEMA DE CHAT CON MONITOREO COMPLETO
// Lab5 - Node.js + Express + Socket.IO
// ========================================

// 1. Cargar variables de entorno PRIMERO
import 'dotenv/config';

// 2. Inicializar tracing ANTES de cualquier otra importación
//    (OpenTelemetry necesita instrumentar módulos antes de que se carguen)
import { initTracing } from './tracing.js';
const tracingSDK = initTracing();

// 3. Importar sistema de logging
import logger, { loggerMiddleware, sendAlert } from './logger.js';

// 4. Importar sistema de métricas
import { 
  metricsMiddleware, 
  metricsHandler,
  socketConnectionsTotal,
  chatMessagesTotal 
} from './metrics.js';

// 5. Importar dependencias de la aplicación
import validation from './libs/unalib.js';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ========================================
// CONFIGURACIÓN INICIAL
// ========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const http = createServer(app);
const io = new Server(http);
const port = process.env.PORT || 3000;

logger.info('🚀 Iniciando servidor Lab5...');
logger.info(`📊 Nivel de log: ${process.env.LOG_LEVEL || 'info'}`);
logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);

// ========================================
// MIDDLEWARES GLOBALES
// ========================================

// 1. Logging de requests (debe ir antes de las rutas)
app.use(loggerMiddleware);

// 2. Métricas de requests (debe ir antes de las rutas)
app.use(metricsMiddleware);

// 3. Parser de JSON para requests POST
app.use(express.json());

// ========================================
// RUTAS DE MONITOREO Y HEALTH
// ========================================

/**
 * GET /health - Health check para Render y load balancers
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * GET /metrics - Endpoint de métricas Prometheus
 * Compatible con Grafana, Prometheus, DataDog, etc.
 */
app.get('/metrics', metricsHandler);

/**
 * GET /error - Endpoint de prueba para simular errores y alertas
 * Útil para testing del sistema de monitoreo
 */
app.get('/error', (req, res) => {
  logger.error('⚠️  Endpoint /error invocado - Simulando error 500');
  
  // Enviar alerta inmediatamente
  sendAlert(
    '🧪 Test de error generado desde /error endpoint',
    'error',
    {
      'Tipo': 'Test Manual',
      'Endpoint': '/error',
      'Usuario': req.ip || 'unknown'
    }
  );
  
  res.status(500).json({
    error: 'Error simulado para testing de monitoreo',
    timestamp: new Date().toISOString()
  });
});

// ========================================
// RUTA PRINCIPAL DE LA APLICACIÓN
// ========================================

/**
 * GET / - Servir el HTML del chat
 */
app.get('/', (req, res) => {
  logger.info(`📄 Sirviendo index.html a ${req.ip || 'unknown'}`);
  res.sendFile(join(__dirname, 'index.html'));
});

// ========================================
// CONFIGURACIÓN DE SOCKET.IO
// ========================================

io.on('connection', (socket) => {
  // Registrar nueva conexión
  logger.info(`🔌 Nueva conexión Socket.IO: ${socket.id}`);
  socketConnectionsTotal.inc({ event: 'connect' });
  
  // Listener para mensajes del chat
  socket.on('Evento-Mensaje-Server', (msg) => {
    try {
      // Validar y sanitizar mensaje
      const validatedMsg = validation.validateMessage(msg);
      
      // Incrementar contador de mensajes procesados
      chatMessagesTotal.inc({ validated: 'success' });
      
      // Log del mensaje (sin contenido sensible en producción)
      if (process.env.NODE_ENV !== 'production') {
        logger.debug(`💬 Mensaje recibido y validado: ${socket.id}`);
      }
      
      // Emitir mensaje validado a todos los clientes
      io.emit('Evento-Mensaje-Server', validatedMsg);
      
    } catch (error) {
      // Error en validación de mensaje
      logger.error(`❌ Error validando mensaje de ${socket.id}: ${error.message}`);
      chatMessagesTotal.inc({ validated: 'error' });
      
      // Opcional: enviar alerta si hay muchos errores de validación
      // (podría indicar un ataque)
    }
  });
  
  // Listener para desconexiones
  socket.on('disconnect', () => {
    logger.info(`🔌 Desconexión Socket.IO: ${socket.id}`);
    socketConnectionsTotal.inc({ event: 'disconnect' });
  });
});

// ========================================
// MANEJO DE ERRORES GLOBAL
// ========================================

/**
 * Middleware de manejo de errores (debe ir al final)
 * Note: next parameter is required by Express error middleware signature
 */
app.use((err, req, res, _next) => {
  logger.error(`💥 Error no manejado: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });
  
  // Enviar alerta crítica
  sendAlert(
    `💥 Error crítico no manejado: ${err.message}`,
    'critical',
    {
      'URL': req.originalUrl,
      'Método': req.method,
      'Stack': err.stack?.substring(0, 200) // Primeros 200 chars
    }
  );
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================

// Solo iniciar el servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  http.listen(port, () => {
    logger.info('='.repeat(50));
    logger.info(`✅ Servidor iniciado exitosamente`);
    logger.info(`🌐 Puerto: ${port}`);
    logger.info(`📡 URL: http://localhost:${port}`);
    logger.info(`📊 Métricas: http://localhost:${port}/metrics`);
    logger.info(`❤️  Health: http://localhost:${port}/health`);
    logger.info(`🧪 Test Error: http://localhost:${port}/error`);
    logger.info('='.repeat(50));
    
    // Enviar alerta de inicio (opcional)
    if (process.env.ALERT_WEBHOOK_URL) {
      sendAlert(
        '🚀 Servidor Lab5 iniciado correctamente',
        'info',
        {
          'Puerto': port,
          'Versión Node': process.version,
          'Tracing': tracingSDK ? 'Habilitado' : 'Deshabilitado'
        }
      );
    }
  });
}

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

process.on('SIGTERM', async () => {
  logger.info('⚠️  SIGTERM recibido. Cerrando servidor gracefully...');
  
  http.close(() => {
    logger.info('✅ Servidor HTTP cerrado');
    
    if (tracingSDK) {
      tracingSDK.shutdown()
        .then(() => logger.info('✅ Tracing SDK cerrado'))
        .catch((err) => logger.error('Error cerrando Tracing SDK', err))
        .finally(() => process.exit(0));
    } else {
      process.exit(0);
    }
  });
});


// 🧪 PRUEBA: Código vulnerable para probar Semgrep
app.get('/test-eval', (req, res) => {
  const code = req.query.code;
  eval(code); // ⚠️ Semgrep debería detectar esto
  res.send('Ejecutado');
});




export default app;
