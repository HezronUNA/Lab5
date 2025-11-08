# ðŸ›¡ï¸ Estó¡ndar de Desarrollo - UNA Chat

## Convenciones generales

- Usar siempre TypeScript.
- Usar nombres de variables en camelCase.
- Prohibido el uso de `any` sin justificació³n.
- Siempre manejar errores con `try/catch`.
- Validar todas las entradas del usuario antes de procesarlas.

## Buenas pró¡cticas de seguridad

- No guardar contraseó±as en texto plano.
- No exponer tokens en el frontend.
- Usar variables de entorno (.env) seguras.
- Evitar dependencias sin mantenimiento (ver SBOM).
- Revisar el có³digo con Snyk o Semgrep antes de hacer commit.

## Buenas pró¡cticas de commits

- Mensajes claros y descriptivos (`feat:`, `fix:`, `docs:`).
- Ejecutar `npm run lint` antes de hacer push.

# 1. Convenciones de Có³digo y Estilo

Lenguaje principal: JavaScript (Node.js, CommonJS)

## 1.1 Nomenclatura

- Variables y funciones
  - lowerCamelCase: totalAmount, getUserById.
  - Funciones: verbo + sustantivo. Booleans con prefijos is/has/should/can.
  - Evitar abreviaturas y nombres ambiguos; usar nombres descriptivos.
  - Promesas: usar nombres que describan el resultado (user, users), no "\*Promise".
- Clases y tipos documentados
  - Clases: PascalCase, p. ej., UserService, AuthController.
  - Tipos definidos con JSDoc (@typedef/@enum): PascalCase para el nombre del tipo; si simulas enums con objetos, usar UPPER_SNAKE_CASE para sus miembros.
- Constantes globales
  - UPPER_SNAKE_CASE: DEFAULT_TIMEOUT_MS, API_BASE_URL.
  - Evitar "números mágicos": declarar constantes con nombre.
- Nombres de archivos y directorios
  - Preferir kebab-case para archivos y carpetas: user-service.js, auth-controller.test.js.
  - Se aceptan módulos existentes con nombre histórico (ej.: `libs/unalib.js`).
  - Un archivo por módulo principal; el nombre refleja el contenido.
  - Archivos de índice solo para reexportar o puntos de entrada explícitos (ej.: index.js, server.js).

## 1.2 Formato

- Sangría
  - 2 espacios. No usar tabulaciones.
- Longitud máxima de línea
  - 120 caracteres. Romper líneas antes si mejora la legibilidad.
- Espaciado
  - Espacios alrededor de operadores: a + b, x === y.
  - Espacio después de comas: fn(a, b).
  - Objetos y arrays: { key: value }, [1, 2, 3].
  - Funciones: espacio antes de la llave y después de paréntesis: function x(a, b) { … } / (a, b) => { … }.
- Posición de las llaves
  - Estilo K&R: llave de apertura en la misma línea para bloques, clases y funciones.
  - Siempre usar llaves en bloques de control, incluso para una sola instrucción.
- Punto y coma y comillas
  - Usar punto y coma al final de cada sentencia.
  - Preferir comillas simples para strings ('…'); usar template literals (`` `…${x}` ``) para interpolación.

## 1.3 Estructura

- Orden de imports/requires
  1. Mó³dulos nativos de Node (fs, path).
  2. Dependencias externas (npm).
  3. Alias del proyecto (si existen).
  4. Rutas relativas internas (primero "€œ./"€¦"€, luego "€œ../"€¦"€).
  - Separar grupos con una ló­nea en blanco.
  - Orden alfabó©tico dentro de cada grupo.
  - CommonJS: preferir un require por mó³dulo y destructuring cuando aplique: const { Router } = require('express').
  - Nota: el lint aplica a archivos .js del repositorio; scripts inline dentro de HTML no se lintó©an por defecto.
- Comentarios obligatorios
  - Usar JSDoc en:
    - Clases póºblicas y mó³dulos exportados.
    - Funciones y mó©todos exportados o usados como handlers de rutas/middleware.
  - Incluir como mó­nimo:
    - Descripció³n breve de propó³sito y efectos laterales.
    - @param para cada paró¡metro con tipo y significado.
    - @returns con la descripció³n del valor devuelto (o @returns {void}).
    - @throws para errores esperados.
    - Ejemplo breve cuando sea óºtil.

## 2. Pró¡cticas de Calidad Obligatorias

- Linting (obligatorio)

  - E ntes de commitear o abrir un PR.
  - Herramienta: ESLint. Reglas base alineadas a estas normas, con tolerancia para el có³digo existente a fin de evitar refactors grandes.
  - Comando: `npm run lint`.

- Build/Compilació³n (obligatorio)

  - Este proyecto no requiere transpilació³n; la verificació³n de "€œbuild"€ ejecuta el linter como chequeo mó­nimo de integridad.
  - La build debe pasar localmente y en CI sin errores.
  - Comando: `npm run build` (alias de `npm run lint`).

- BDD (Behavior-Driven Development) (obligatorio)

  - Se usa Cucumber.js para describir el comportamiento desde la perspectiva del usuario.
  - Estructura:
    - `features/*.feature` para especificaciones en Gherkin.
    - `features/steps/*.steps.js` para definiciones de pasos.
  - Los escenarios deben cubrir el "€œhappy path"€ y al menos 1 caso de borde relevante por funcionalidad.
  - Comandos:
    - `npm run test:bdd` para ejecutar solo BDD (Cucumber).
    - `npm test` ejecuta pruebas unitarias (Mocha) y BDD (Cucumber).

- Pruebas unitarias (obligatorio)
  - Framework: Mocha (tests en `test/`).
  - Comandos:
    - `npm run test:unit` para unit tests.
    - `npm test` para unit + BDD.

# 3. Reglas Específicas para Agentes de IA

Estas pautas aplican si se integra un agente/servicio de IA (por ejemplo, consumo de LLM vía API) dentro de este proyecto Node.js (Express + Socket.IO). Priorizar seguridad, privacidad y control de salidas.

## 3.1 Datos y Privacidad

- Minimización de datos: enviar al proveedor de IA solo lo estrictamente necesario. Nunca incluir tokens de sesión (`req.appSession`, `req.oidc.idToken`, `access_token`) ni identificadores sensibles.
- PII y secretos: redactar/anonimizar emails, nombres, IDs y secretos antes de construir prompts o logs.
- Retención: no persistir conversaciones con PII salvo requerimiento explícito y con tiempo de retención definido; si se guardan, cifrar en reposo.
- Consentimiento y base legal: documentar para qué se usan los datos y cómo se almacenan/anonymizan.

## 3.2 Seguridad de Prompts y Contexto

- Prompt injection: usar un system prompt claro con políticas inapelables (qué puede y no puede hacer), y filtrar/neutralizar instrucciones del usuario que pidan exfiltrar datos o saltarse controles.
- Contexto controlado: si se hace retrieval (RAG), curar y sanear fuentes; no aceptar URLs arbitrarias del usuario sin validación/allowlist.
- No ejecución dinámica: nunca ejecutar código devuelto por el modelo (eval, Function, child_process) ni comandos shell generados por el modelo sin una revisión y confirmación explícita.

## 3.3 Gestión de Secretos y Accesos

- Configuración solo por variables de entorno: `AI_PROVIDER`, `AI_API_KEY`, etc. No hardcodear credenciales en código ni vistas.
- Scope por usuario: si se personaliza el contexto, derivarlo del usuario autenticado (`requiresAuth()`), pero sin exponer claims completos al modelo; incluir solo atributos necesarios y, si es posible, pseudonimizados.
- No registrar secretos: nunca loggear API keys, tokens o prompts con datos sensibles. Enmascarar logs.

## 3.4 Integraciones, Red y Límite de Daño

- Egress controlado: definir allowlist de dominios de salida para llamadas de IA.
- Rate limiting y cuotas: aplicar rate-limit por IP/usuario a los endpoints de IA para evitar abuso y costos inesperados.
- Timeouts y reintentos: configurar timeouts razonables y reintentos con backoff; no bloquear el hilo de evento.
- Validación de salidas: validar y sanear la respuesta del modelo (JSON schema si aplica) antes de usarla o mostrarla.

## 3.5 Registro, Monitoreo y Alertas

- Trazabilidad: registrar mó©tricas (latencia, tamaó±o de prompt/respuesta, tasa de error) sin PII.
- Alertas: umbrales por error rate/timeout/spike de costos. Revisiones perió³dicas.
- Redacció³n de logs: aplicar mó¡scaras a emails y tokens en cualquier log de middleware o de agentes.

## 3.6 Evaluació³n y Pruebas

- BDD para agentes: describir comportamientos esperados y ló­mites de seguridad en `.feature` (ej.: "€œel agente no debe revelar secretos"€, "€œredacta emails"€).
- Pruebas de inyecció³n: incluir escenarios con intentos de prompt injection/exfiltració³n y verificar mitigaciones.
- Test contractuales: si la salida debe ser JSON, validar contra un esquema.

## 3.7 Despliegue y Dependencias

- Versionado de modelos: fijar versiones o familias de modelos; no degradar automó¡ticamente a modelos menos seguros en producció³n.
- Dependencias minimalistas: evitar SDKs innecesarios; revisar licencias y vulnerabilidades (npm audit) antes de actualizar.
- Separació³n ló³gica: encapsular la integració³n de IA en `services/ai/` y exponer una interfaz sencilla (contrato) al resto de la app.

## 3.8 Cumplimiento y Contenido

- Políticas de uso: bloquear usos no permitidos (contenido ilegal, sensible, datos de menores). Documentar categorías prohibidas y mensajes de error consistentes.
- Localización de datos: si aplica, seleccionar regiones del proveedor; documentar el flujo de datos transfronterizo.

## 3.9 Respuesta a Incidentes

- Playbook: definir qué hacer ante fuga de datos, abuso de API o respuestas peligrosas (desactivar endpoints, rotar keys, notificar).
- Observabilidad: conservar evidencias no sensibles para análisis post mortem.

## 3.10 Contrato mínimo de un agente (ejemplo)

- Entrada: `{ userId, intent, inputText, contextSanitized }`.
- Salida: `{ success: boolean, content: string | object, redactions: string[], warnings: string[] }`.
- Errores: timeouts, validación, proveedor no disponible; nunca incluir datos sensibles en mensajes de error.
- Criterio de éxito: respuesta conforme a política, sin PII no autorizada, dentro de límites de longitud/tiempo.

## 3.11 Aplicación práctica en este proyecto

- Estado actual: hoy la app no integra un agente de IA. Estas reglas aplican cuando se incorpore.
- Ubicación sugerida: crear `services/ai/client.js` para el cliente del proveedor y `routes/ai.js` para endpoints, con validaciones, sanitización y rate-limit.
- Variables de entorno: declarar `AI_PROVIDER`, `AI_API_KEY`, `AI_BASE_URL`, `AI_TIMEOUT_MS`. No incluirlas en el repositorio.
- BDD: añadir `features/ai-security.feature` con escenarios de no-exfiltración y redacción de PII; validar salidas contra esquema cuando corresponda.

---

# 4. Versiones y dependencias actuales

Este proyecto usa las siguientes dependencias principales:

- **Runtime** (Producció³n)

  - Express: `*` (recomendado fijar a ^4.18.2)
  - Socket.IO (servidor): `*` (recomendado fijar a ^4.7.2)
  - **Nota**: Las versiones estó¡n sin fijar (`*`). Se recomienda especificar versiones exactas para mayor estabilidad.

- **Desarrollo**

  - ESLint: ^9.39.1 (configuració³n flat config)
  - @eslint/js: ^9.39.1
  - Jest: ^30.2.0 (framework de pruebas)
  - Supertest: ^7.1.0 (testing de servidor HTTP)
  - TypeScript ESLint: ^8.46.3 (soporte futuro)
  - Globals: ^16.5.0

- **Frontend** (CDN en `index.html`)

  - Socket.IO client: 4.7.2 (https://cdn.socket.io/4.7.2/socket.io.js)
  - jQuery: 1.11.1 (https://code.jquery.com/jquery-1.11.1.js)
    - "š ï¸ **Advertencia de seguridad**: jQuery 1.11.1 (2014) tiene vulnerabilidades conocidas. Se recomienda actualizar a 3.7+ o migrar a Vanilla JavaScript.

- **Configuració³n del proyecto**
  - Tipo de mó³dulos: ES Modules (`"type": "module"` en package.json)
  - Node.js: Recomendado v20.x LTS (segóºn Dockerfile)
  - Runtime: Node.js con soporte nativo de ES Modules

**Notas importantes**

- El lint aplica a archivos .js del repositorio (no a scripts inline del HTML por defecto).
- Jest estó¡ configurado con `testEnvironment: "node"` y sin transformaciones.
- Comando de test: `npm test` ejecuta Jest con `--experimental-vm-modules` para soporte de ES Modules.
- El proyecto incluye archivos de seguridad: `snyk-bom.json` (SBOM) y `snyk-report.json` (reporte de vulnerabilidades).
- Docker: Imagen base `node:20-alpine` con usuario no privilegiado (nodejs:1001).



