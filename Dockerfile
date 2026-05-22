# Usamos una versión estable de Node LTS
FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (para aprovechar el cache de Docker)
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto que definiste
EXPOSE 7777

# Comando para iniciar la app (usamos node directamente, no nodemon)
CMD ["node", "index.js"]