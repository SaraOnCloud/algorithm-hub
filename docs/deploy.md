# Despliegue (Docker Compose)

Objetivo
Levantar MariaDB, backend (NestJS), frontend (Angular) y reverse proxy Traefik con HTTPS automático (Let's Encrypt).

Requisitos
- Docker Desktop actualizado
- Archivo backend/.env con variables de DB y JWT
- Archivo .env (en la raíz) con DOMAIN y LE_EMAIL
  - DOMAIN=midominio.com (sin protocolo)
  - LE_EMAIL=correo@midominio.com (email válido para certificados)
  - DNS: crear registros A:
    - midominio.com -> IP del servidor
    - api.midominio.com -> IP del servidor

## docker-compose.yml (resumen relevante)
```yaml
services:
  traefik:
    image: traefik:v3.0
    command:
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --entrypoints.web.http.redirections.entryPoint.to=websecure
      - --entrypoints.web.http.redirections.entryPoint.scheme=https
      - --certificatesresolvers.letsencrypt.acme.email=${LE_EMAIL}
      - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
    ports: ["80:80", "443:443"]
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_letsencrypt:/letsencrypt

  backend:
    labels:
      - traefik.enable=true
      - traefik.http.routers.backend.rule=Host(`api.${DOMAIN}`)
      - traefik.http.routers.backend.entrypoints=websecure
      - traefik.http.routers.backend.tls.certresolver=letsencrypt
      - traefik.http.services.backend.loadbalancer.server.port=3000

  frontend:
    labels:
      - traefik.enable=true
      - traefik.http.routers.frontend.rule=Host(`${DOMAIN}`)
      - traefik.http.routers.frontend.entrypoints=websecure
      - traefik.http.routers.frontend.tls.certresolver=letsencrypt
      - traefik.http.services.frontend.loadbalancer.server.port=80
```

## Pasos
1) Preparar backend/.env con DB_HOST=db, credenciales, JWT_SECRET, etc.
2) Crear .env en la raíz copiando .env.example y ajustando DOMAIN y LE_EMAIL.
3) Configurar DNS (A records) hacia la IP pública antes de levantar contenedores.
4) (Opcional pruebas) Activar CA de staging de Let's Encrypt descomentando la línea caserver en servicio traefik para evitar rate limits.
5) Levantar servicios:
```
Docker compose up -d --build
```
6) Ver logs de Traefik y confirmar emisión de certificados:
```
Docker compose logs -f traefik
```
7) Acceder:
- Web: https://DOMAIN
- API: https://api.DOMAIN (añadir /api/v1 según rutas)
8) Ejecutar migraciones / seed si procede:
```
Docker compose exec backend npm run typeorm:migration:run
Docker compose exec backend npm run seed:run
```

## Producción (hardening adicional)
- Activar middleware de cabeceras (ya incluido: HSTS, XSS filter, etc.).
- Añadir rate limiting (Traefik plugin o a nivel app / CDN).
- Forzar HTTPS (ya redirección automática configurada).
- Implementar backups de volumen db_data y cifrado en reposo según infraestructura.
- Usar staging para validar primera vez, luego volver a producción (eliminar caserver).

## Troubleshooting
- Certificado no emitido: comprobar DNS propagado y que puertos 80/443 estén abiertos.
- 404 desde dominio: revisar labels y variable DOMAIN cargada (docker compose config | grep DOMAIN).
- Renovación: automática (ACME). No tocar acme.json.
- Rate limit: usar entorno de staging temporalmente.

## Comandos útiles
```
Docker compose ps
Docker compose logs -f traefik
Docker compose exec backend curl -I http://localhost:3000/api/v1/algorithms
Docker compose config
```

## Variables clave
- DOMAIN: dominio raíz (sin protocolo)
- LE_EMAIL: email para ACME
- JWT_SECRET / JWT_EXPIRES_IN: backend
- DB_*: credenciales DB
