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

var app = express();
var http = createServer(app);
var io = new Server(http);
var port = process.env.PORT || 3000;

// Middlewares de Sentry antes de las rutas
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

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

// Handler de errores de Sentry después de rutas/controladores
app.use(Sentry.Handlers.errorHandler());

// Solo iniciar el servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  http.listen(port, function () {
    console.log('listening on *:' + port);
  });
}

export default app;
