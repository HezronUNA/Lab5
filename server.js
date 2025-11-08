// npm install para descargar los paquetes...
import 'dotenv/config';
// Importar instrumentación de Sentry LO PRIMERO
import './instrument.js';
import validation from './libs/unalib.js';
import express from 'express';
import { Sentry } from './instrument.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const http = createServer(app);
const io = new Server(http);
const port = process.env.PORT || 3000;

// Middlewares de Sentry (SDK v10): el handler de errores se agrega después de las rutas
// El SDK actual no expone Sentry.Handlers.*; el tracing y request data se auto-instrumentan.

// root: presentar html
app.get('/', function (req, res) {
  res.sendFile(join(__dirname, 'index.html'));
});

// escuchar una conexion por socket
io.on('connection', function (socket) {
  // si se escucha "chat message"
  socket.on('Evento-Mensaje-Server', function (msg) {
    msg = validation.validateMessage(msg);
    // volvemos a emitir el mismo mensaje
    io.emit('Evento-Mensaje-Server', msg);
  });
});

// Ruta para probar el envío de errores a Sentry
app.get('/error', function () {
  throw new Error('Sentry test error');
});

// Ruta para probar profiling + captura de excepción usando span
app.get('/sentry-test', function (req, res) {
  Sentry.startSpan({ op: 'test', name: 'My First Test Span' }, () => {
    try {
      Sentry.logger.info('User triggered test error', { action: 'test_error_span' });
      // Error intencional
      // eslint-disable-next-line no-undef
      foo();
    } catch (e) {
      Sentry.captureException(e);
    }
  });
  res.json({ status: 'span executed, error captured' });
});

// Ruta para probar logging (console + logger) y traces
app.get('/sentry-log', function (req, res) {
  console.log('Test log from /sentry-log');
  console.warn('Test warn from /sentry-log');
  console.error('Test error from /sentry-log');

  Sentry.logger.info('User triggered test log', { action: 'test_log' });

  Sentry.startSpan({ op: 'test', name: 'Log Test Span' }, () => {
    // trabajo simulado
    for (let i = 0; i < 1e5; i++);
  });

  res.json({ status: 'logs and span sent' });
});

// Handler de errores de Sentry después de rutas/controladores
app.use(Sentry.expressErrorHandler());

// Solo iniciar el servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  http.listen(port, function () {
    console.log('listening on *:' + port);
  });
}

export default app;
