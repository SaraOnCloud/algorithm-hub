# Frontend (Angular) multi-stage
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
# Usar npm ci para builds reproducibles
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM deps AS build
COPY angular.json tsconfig*.json ./
COPY tailwind.config.js postcss.config.js ./
# Copiar solo código necesario (evita .vscode u otros artefactos)
COPY src ./src
RUN npm run build

FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html
ENV NODE_ENV=production
RUN rm -rf ./*
COPY --from=build /app/dist /tmp/dist
# Lógica robusta para diferentes estructuras de salida Angular
RUN set -eux; \
    if [ -f /tmp/dist/frontend/index.html ]; then \
      cp -r /tmp/dist/frontend/* ./; \
    elif [ -f /tmp/dist/frontend/browser/index.html ]; then \
      cp -r /tmp/dist/frontend/browser/* ./; \
    elif [ -f /tmp/dist/index.html ]; then \
      cp -r /tmp/dist/* ./; \
    elif [ -f /tmp/dist/browser/index.html ]; then \
      cp -r /tmp/dist/browser/* ./; \
    else \
      echo 'No se encontró index.html en el build de Angular' && ls -R /tmp/dist && exit 1; \
    fi
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
