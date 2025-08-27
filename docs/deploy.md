# Deployment (Docker Compose)

Objective  
Deploy MariaDB, backend (NestJS), frontend (Angular), and Traefik reverse proxy with automatic HTTPS (Let's Encrypt).

Requirements
- Updated Docker Desktop
- `backend/.env` file with DB and JWT variables
- `.env` file (in the root) with DOMAIN and LE_EMAIL
  - `DOMAIN=yourdomain.com` (without protocol)
  - `LE_EMAIL=your@email.com` (valid email for certificates)
  - DNS: create A records:
    - yourdomain.com -> server IP
    - api.yourdomain.com -> server IP

## docker-compose.yml (relevant summary)
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

## Steps
1) Prepare `backend/.env` with `DB_HOST=db`, credentials, `JWT_SECRET`, etc.
2) Create `.env` in the root by copying `.env.example` and setting DOMAIN and LE_EMAIL.
3) Configure DNS (A records) to the public IP before starting containers.
4) (Optional testing) Enable Let's Encrypt staging CA by uncommenting the `caserver` line in the traefik service to avoid rate limits.
5) Start services:
```
docker compose up -d --build
```
6) View Traefik logs and confirm certificate issuance:
```
docker compose logs -f traefik
```
7) Access:
- Web: https://DOMAIN
- API: https://api.DOMAIN (add /api/v1 as needed)
8) Run migrations / seed if needed:
```
docker compose exec backend npm run typeorm:migration:run
docker compose exec backend npm run seed:run
```

## Production (additional hardening)
- Enable header middleware (already included: HSTS, XSS filter, etc.).
- Add rate limiting (Traefik plugin or at app/CDN level).
- Enforce HTTPS (automatic redirect already configured).
- Implement backups for db_data volume and at-rest encryption as per infrastructure.
- Use staging to validate the first time, then switch back to production (remove caserver).

## Troubleshooting
- Certificate not issued: check DNS propagation and that ports 80/443 are open.
- 404 from domain: check labels and DOMAIN variable loaded (`docker compose config | grep DOMAIN`).
- Renewal: automatic (ACME). Do not touch acme.json.
- Rate limit: use staging environment temporarily.

## Useful commands
```
docker compose ps
docker compose logs -f traefik
docker compose exec backend curl -I http://localhost:3000/api/v1/algorithms
docker compose config
```

## Key variables
- DOMAIN: root domain (no protocol)
- LE_EMAIL: email for ACME
- JWT_SECRET / JWT_EXPIRES_IN: backend
- DB_*: DB credentials

