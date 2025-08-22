# Backend (NestJS) multi-stage
FROM node:20-alpine AS deps
WORKDIR /app
# Dependencias de compilación necesarias para argon2 y otros módulos nativos
RUN apk add --no-cache --virtual .build-deps python3 make g++
COPY package*.json ./
# Usar npm ci si existe lock para builds reproducibles
RUN if [ -f package-lock.json ]; then npm ci --omit=optional; else npm install --omit=optional; fi

FROM deps AS build
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# Instalar solo dependencias de producción para la imagen final
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev --omit=optional; else npm install --omit=dev --omit=optional; fi

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copiar solo las dependencias de producción y el código compilado
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package*.json ./
COPY --from=build /app/dist ./dist
# Eliminar dependencias de compilación (no instaladas en esta capa) por limpieza defensiva
RUN rm -rf /var/cache/apk/*
EXPOSE 3000
CMD ["node", "dist/main.js"]
