// npm install para descargar los paquetes...
import validation from './libs/unalib.js';
import express from 'express';
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

// Solo iniciar el servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  http.listen(port, function () {
    console.log('listening on *:' + port);
  });
}

export default app;
