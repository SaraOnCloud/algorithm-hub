# Setup local en macOS

Prerrequisitos
- Node.js LTS >= 20 (recomendado via nvm)
- pnpm >= 9 (o npm)
- Git y Docker Desktop (opcional para DB)
- Angular CLI y Nest CLI: npm i -g @angular/cli @nestjs/cli

1) Clonar el repositorio
- git clone <url> algorithm-hub
- cd algorithm-hub

2) Base de datos
Opción A: Docker (recomendada)
- Crear archivo docker-compose.db.yml con servicio de MariaDB o usar el de docs/deploy.md
- docker compose -f docker-compose.db.yml up -d
- Variables por defecto: DB_HOST=localhost DB_PORT=3306 DB_USER=algouser DB_PASSWORD=algopass DB_NAME=algorithm_hub

Opción B: Local nativa
- Instalar MariaDB (brew install mariadb)
- brew services start mariadb
- mysql -u root
  - CREATE DATABASE algorithm_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  - CREATE USER 'algouser'@'%' IDENTIFIED BY 'algopass';
  - GRANT ALL PRIVILEGES ON algorithm_hub.* TO 'algouser'@'%'; FLUSH PRIVILEGES;

3) Variables de entorno (backend)
- Crear backend/.env con:
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=algouser
  DB_PASSWORD=algopass
  DB_NAME=algorithm_hub
  JWT_SECRET=change_me
  JWT_EXPIRES_IN=3600s

4) Instalar dependencias
- cd frontend && pnpm i
- cd ../backend && pnpm i

5) Migraciones y seed
- Ejecutar migraciones TypeORM (según scripts del backend)
- Ejecutar seed inicial de 20 algoritmos (script de seeds)

6) Ejecutar en desarrollo
- Backend: pnpm run start:dev (http://localhost:3000/api/v1)
- Frontend: pnpm start (http://localhost:4200)

7) Probar flujo básico
- POST /auth/register y /auth/login
- GET /algorithms
- POST /me/algorithms/:slug/learn y GET /me/progress

Troubleshooting
- Puertos ocupados: cambiar mapeos en docker-compose o configs CLI
- Conexión DB: verificar firewall, usuario y privilegios; testear con mysql CLI
- Migrations: limpiar dist/ y sincronizar versión de TypeORM

