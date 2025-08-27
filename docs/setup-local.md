# Local Setup on macOS

Prerequisites
- Node.js LTS >= 20 (recommended via nvm)
- pnpm >= 9 (or npm)
- Git and Docker Desktop (optional for DB)
- Angular CLI and Nest CLI: npm i -g @angular/cli @nestjs/cli

1) Clone the repository
- git clone <url> algorithm-hub
- cd algorithm-hub

2) Database
Option A: Docker (recommended)
- Create a docker-compose.db.yml file with a MariaDB service or use the one from docs/deploy.md
- docker compose -f docker-compose.db.yml up -d
- Default variables: DB_HOST=localhost DB_PORT=3306 DB_USER=algouser DB_PASSWORD=algopass DB_NAME=algorithm_hub

Option B: Native local
- Install MariaDB (brew install mariadb)
- brew services start mariadb
- mysql -u root
  - CREATE DATABASE algorithm_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  - CREATE USER 'algouser'@'%' IDENTIFIED BY 'algopass';
  - GRANT ALL PRIVILEGES ON algorithm_hub.* TO 'algouser'@'%'; FLUSH PRIVILEGES;

3) Environment variables (backend)
- Create backend/.env with:
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=algouser
  DB_PASSWORD=algopass
  DB_NAME=algorithm_hub
  JWT_SECRET=change_me
  JWT_EXPIRES_IN=3600s

4) Install dependencies
- cd frontend && pnpm i
- cd ../backend && pnpm i

5) Migrations and seed
- Run TypeORM migrations (see backend scripts)
- Run initial seed for 20 algorithms (seed script)

6) Run in development
- Backend: pnpm run start:dev (http://localhost:3000/api/v1)
- Frontend: pnpm start (http://localhost:4200)

7) Test basic flow
- POST /auth/register and /auth/login
- GET /algorithms
- POST /me/algorithms/:slug/learn and GET /me/progress

Troubleshooting
- Ports in use: change mappings in docker-compose or CLI configs
- DB connection: check firewall, user, and privileges; test with mysql CLI
- Migrations: clean dist/ and sync TypeORM version

