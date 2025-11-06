# Etapa base: Node 20
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --omit=dev --ignore-scripts

# Copiar el resto del código
COPY . .

# Crear usuario no privilegiado
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Cambiar a usuario no privilegiado
USER nodejs

# Exponer el puerto 3000
EXPOSE 3000

# Variable de entorno para producción
ENV NODE_ENV=production

# Comando para ejecutar la app
CMD ["node", "server.js"]
