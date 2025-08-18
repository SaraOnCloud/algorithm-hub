# Despliegue (Docker Compose)

Objetivo
Levantar MariaDB, backend (NestJS) y frontend (Angular) con Docker Compose.

Requisitos
- Docker Desktop actualizado
- Variables de entorno en backend/.env

docker-compose.yml (ejemplo)
version: "3.9"
services:
  db:
    image: mariadb:10.6
    environment:
      MARIADB_DATABASE: algorithm_hub
      MARIADB_USER: algouser
      MARIADB_PASSWORD: algopass
      MARIADB_ROOT_PASSWORD: rootpass
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    env_file:
      - ./backend/.env
    environment:
      DB_HOST: db
      DB_PORT: 3306
      DB_USER: algouser
      DB_PASSWORD: algopass
      DB_NAME: algorithm_hub
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "3000:3000"

  frontend:
    build: ./frontend
    environment:
      - NODE_OPTIONS=--openssl-legacy-provider
    ports:
      - "4200:80"
    depends_on:
      - backend

volumes:
  db_data:

Pasos
1) Preparar backend/.env con JWT_SECRET y DB_* (ver docs/setup-local.md)
2) Construir e iniciar
- docker compose up -d --build
3) Ejecutar migraciones y seed (si no están automatizadas en entrypoint)
- docker compose exec backend npm run typeorm:migration:run
- docker compose exec backend npm run seed:run
4) Acceder
- API: http://localhost:3000/api/v1
- Web: http://localhost:4200

Producción
- Usar imágenes multi-stage para backend y frontend (Nginx para servir Angular)
- Añadir reverse proxy (Nginx/Caddy) con HTTPS (Let's Encrypt)
- Configurar variables de entorno seguras y secretos (docker secrets)
- Habilitar logs y metrics (por ejemplo, a stdout + stack ELK/EFK)

Troubleshooting
- db no saludable: revisar logs con docker compose logs db
- backend no arranca: validar variables y conectividad a db
- puertos en uso: ajustar mapeos en compose

