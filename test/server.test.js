import request from 'supertest';
import app from '../server.js';
import http from 'http';

let server;

beforeAll(() => {
  server = http.createServer(app).listen(0);
});

afterAll(() => {
  server.close();
});

describe('Pruebas del servidor UNA-Chat', () => {
  test('GET / responde con 200', async () => {
    const res = await request(server).get('/');
    expect(res.statusCode).toBe(200);
  });
});
