# Etapa 1: Compilación de la aplicación
FROM node:18-alpine AS build

WORKDIR /app

# Copiar el package.json y package-lock.json para instalar las dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código de la aplicación
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa 2: Servir la aplicación estática
FROM nginx:alpine

# Copiar los archivos estáticos de la compilación
COPY --from=build /app/build /usr/share/nginx/html

# Exponer el puerto en el contenedor
EXPOSE 80

# Iniciar el servidor
CMD ["nginx", "-g", "daemon off;"]
