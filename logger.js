// logger.js - Sistema de logging con Winston y alertas vía webhook
import winston from 'winston';
import axios from 'axios';

// Configuración de niveles de log basados en variable de entorno
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Formato personalizado para los logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // Incluye stack traces
  winston.format.printf(({ timestamp, level, message, stack }) => {
    // Si hay un stack trace (error), lo incluimos
    if (stack) {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`;
    }
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// Configuración de Winston con múltiples transportes
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: customFormat,
  transports: [
    // 1. Console: siempre activo, con colores para desarrollo
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    }),
    
    // 2. Archivo: logs de todos los niveles
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5, // Mantener hasta 5 archivos rotados
    }),
    
    // 3. Archivo de errores: solo errores críticos
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    })
  ],
  // Manejo de excepciones no capturadas
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  // Manejo de promesas rechazadas
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

/**
 * Envía una alerta a Discord/Slack vía webhook
 * @param {string} message - Mensaje de alerta
 * @param {string} level - Nivel de severidad (error, warn, info)
 * @param {object} metadata - Datos adicionales opcionales
 */
export async function sendAlert(message, level = 'error', metadata = {}) {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  
  // Si no hay webhook configurado, solo registramos en logs
  if (!webhookUrl) {
    logger.warn('ALERT_WEBHOOK_URL no configurado. Alerta no enviada:', message);
    return;
  }

  try {
    // Determinar color según severidad (para Discord)
    const colors = {
      error: 15158332,   // Rojo
      warn: 16776960,    // Amarillo
      info: 3447003,     // Azul
      critical: 10038562 // Morado oscuro
    };

    // Payload compatible con Discord Webhooks
    const payload = {
      embeds: [{
        title: `🚨 Alerta: ${level.toUpperCase()}`,
        description: message,
        color: colors[level] || colors.error,
        fields: [
          {
            name: '🌐 Entorno',
            value: process.env.NODE_ENV || 'development',
            inline: true
          },
          {
            name: '⏰ Timestamp',
            value: new Date().toISOString(),
            inline: true
          },
          // Agregar metadata adicional si existe
          ...Object.entries(metadata).map(([key, value]) => ({
            name: key,
            value: String(value),
            inline: true
          }))
        ],
        footer: {
          text: 'Lab5 - Sistema de Monitoreo'
        }
      }]
    };

    // Enviar alerta al webhook
    await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000 // Timeout de 5 segundos
    });

    logger.info(`✅ Alerta enviada exitosamente: ${message}`);
  } catch (error) {
    // Si falla el envío de alerta, no queremos que crashee la app
    logger.error(`❌ Error enviando alerta al webhook: ${error.message}`);
  }
}

/**
 * Middleware de Express para logging automático de requests
 */
export function loggerMiddleware(req, res, next) {
  const start = Date.now();
  
  // Capturar cuando termine la respuesta
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 500 ? 'error' : 
                     res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`);
    
    // Enviar alerta si es un error 500
    if (res.statusCode >= 500) {
      sendAlert(
        `Error ${res.statusCode} en ${req.method} ${req.originalUrl}`,
        'error',
        {
          'Método': req.method,
          'URL': req.originalUrl,
          'Status': res.statusCode,
          'Duración': `${duration}ms`,
          'IP': req.ip || req.connection.remoteAddress
        }
      );
    }
  });
  
  next();
}

export default logger;
