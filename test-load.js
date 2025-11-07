#!/usr/bin/env node

/**
 * Script de prueba de carga para Lab5
 * Genera tráfico HTTP para probar el sistema de monitoreo
 * 
 * Uso:
 *   node test-load.js [url] [requests] [concurrent]
 * 
 * Ejemplo:
 *   node test-load.js http://localhost:3000 100 10
 *   node test-load.js https://lab5-t3vd.onrender.com 1000 50
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

// Configuración
const targetUrl = process.argv[2] || 'http://localhost:3000';
const totalRequests = parseInt(process.argv[3]) || 100;
const concurrent = parseInt(process.argv[4]) || 10;

const url = new URL(targetUrl);
const isHttps = url.protocol === 'https:';
const httpModule = isHttps ? https : http;

console.log('🚀 Iniciando test de carga...');
console.log(`📍 URL: ${targetUrl}`);
console.log(`📊 Requests totales: ${totalRequests}`);
console.log(`⚡ Concurrencia: ${concurrent}`);
console.log('─'.repeat(50));

let completed = 0;
let errors = 0;
let durations = [];
const startTime = Date.now();

/**
 * Realiza un request HTTP
 */
function makeRequest() {
  const reqStart = Date.now();
  
  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: url.pathname || '/',
    method: 'GET',
    headers: {
      'User-Agent': 'Lab5-LoadTest/1.0'
    }
  };

  const req = httpModule.request(options, (res) => {
    // Consumir datos de la respuesta
    res.on('data', () => {
      // Data consumed but not stored
    });
    
    res.on('end', () => {
      const duration = Date.now() - reqStart;
      durations.push(duration);
      completed++;
      
      const status = res.statusCode;
      const icon = status < 300 ? '✅' : status < 400 ? '⚠️' : '❌';
      
      if (status >= 400) {
        errors++;
      }
      
      // Mostrar progreso cada 10 requests
      if (completed % 10 === 0) {
        const progress = ((completed / totalRequests) * 100).toFixed(1);
        console.log(`${icon} ${completed}/${totalRequests} (${progress}%) - Status: ${status} - ${duration}ms`);
      }
      
      // Continuar enviando requests si quedan pendientes
      if (completed + errors < totalRequests) {
        makeRequest();
      }
      
      // Mostrar resultados finales
      if (completed + errors >= totalRequests) {
        showResults();
      }
    });
  });

  req.on('error', (err) => {
    errors++;
    console.error(`❌ Error: ${err.message}`);
    
    // Continuar si quedan requests
    if (completed + errors < totalRequests) {
      makeRequest();
    }
    
    if (completed + errors >= totalRequests) {
      showResults();
    }
  });

  req.setTimeout(10000, () => {
    req.destroy();
    errors++;
    console.error('⏱️  Timeout');
  });

  req.end();
}

/**
 * Muestra resultados finales
 */
function showResults() {
  const totalTime = (Date.now() - startTime) / 1000;
  
  console.log('\n' + '═'.repeat(50));
  console.log('📊 RESULTADOS DEL TEST DE CARGA');
  console.log('═'.repeat(50));
  
  console.log(`\n⏱️  Tiempo total: ${totalTime.toFixed(2)}s`);
  console.log(`✅ Requests exitosos: ${completed}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📈 Requests/segundo: ${(totalRequests / totalTime).toFixed(2)}`);
  
  if (durations.length > 0) {
    durations.sort((a, b) => a - b);
    
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = durations[0];
    const max = durations[durations.length - 1];
    const p50 = durations[Math.floor(durations.length * 0.5)];
    const p95 = durations[Math.floor(durations.length * 0.95)];
    const p99 = durations[Math.floor(durations.length * 0.99)];
    
    console.log(`\n📉 Latencia (ms):`);
    console.log(`   Min: ${min}ms`);
    console.log(`   Max: ${max}ms`);
    console.log(`   Avg: ${avg.toFixed(2)}ms`);
    console.log(`   p50: ${p50}ms`);
    console.log(`   p95: ${p95}ms`);
    console.log(`   p99: ${p99}ms`);
  }
  
  console.log('\n💡 Próximos pasos:');
  console.log(`   1. Ver métricas: ${targetUrl}/metrics`);
  console.log(`   2. Verificar logs en logs/combined.log`);
  console.log(`   3. Revisar alertas en Discord/Slack (si configurado)`);
  
  console.log('\n' + '═'.repeat(50));
}

// Iniciar requests con concurrencia controlada
console.log(`\n🔄 Enviando primeros ${concurrent} requests...\n`);
for (let i = 0; i < Math.min(concurrent, totalRequests); i++) {
  makeRequest();
}
