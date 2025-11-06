# 🛡️ Estándar de Desarrollo - UNA Chat

## Convenciones generales
- Usar siempre TypeScript.
- Usar nombres de variables en camelCase.
- Prohibido el uso de `any` sin justificación.
- Siempre manejar errores con `try/catch`.
- Validar todas las entradas del usuario antes de procesarlas.

## Buenas prácticas de seguridad
- No guardar contraseñas en texto plano.
- No exponer tokens en el frontend.
- Usar variables de entorno (.env) seguras.
- Evitar dependencias sin mantenimiento (ver SBOM).
- Revisar el código con Snyk o Semgrep antes de hacer commit.

## Buenas prácticas de commits
- Mensajes claros y descriptivos (`feat:`, `fix:`, `docs:`).
- Ejecutar `npm run lint` antes de hacer push.
