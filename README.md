# Algorithm Hub

Full-stack application for learning algorithms. Frontend in Angular, backend in NestJS with TypeORM and MariaDB. Users can register, explore a catalog of 20 predefined algorithms, mark them as learned, and track their overall progress.

Key content
- Stack: Angular 17+, NestJS 10+, TypeScript, TypeORM, MariaDB 10.6+, JWT, ESLint, Prettier.
- Architecture: simple monorepo with frontend/, backend/, and docs/ folders.
- Quality: Clean Code, SOLID, unit and e2e tests, suggested CI/CD with GitHub Actions.
- Deployment: Docker Compose + Traefik (automatic HTTPS with Let's Encrypt).

Repository structure
- frontend/ Angular application
- backend/ NestJS API (TypeORM + MariaDB)
- docs/ Technical and functional documentation
- README.md This file

Requirements
- Node.js LTS (>= 20)
- npm or pnpm (pnpm >= 9 recommended)
- MariaDB 10.6+ or Docker Desktop
- Angular CLI and Nest CLI (optional for development):
  - npm i -g @angular/cli @nestjs/cli

Quick setup (local)
1) Database
- Docker option: see docs/deploy.md for docker-compose with MariaDB
- Local option:
  - Create algorithm_hub database and user with permissions
2) Environment variables
- Backend: create backend/.env with
  - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
  - JWT_SECRET, JWT_EXPIRES_IN
- Frontend: adjust Angular environments for API_URL
3) Installation
- cd frontend && npm i
- cd backend && npm i
4) Migrations and seed
- Run TypeORM migrations
- Run initial seed for 20 algorithms
5) Run
- Backend: npm run start:dev
- Frontend: npm start

Deployment with HTTPS (summary)
- Copy .env.example to .env and set DOMAIN and LE_EMAIL.
- Configure DNS: DOMAIN and api.DOMAIN pointing to the server IP.
- docker compose up -d --build
- Access: https://DOMAIN and https://api.DOMAIN
- See more details/hardening in docs/deploy.md and docs/security.md.

Features
- Registration and login with JWT
- List and detail of 20 predefined algorithms
- Mark/unmark algorithm as learned
- Global progress calculation (learned/total)

Documentation
- docs/architecture.md General architecture and modules
- docs/api.md REST API contract
- docs/db.md Data schema and entities
- docs/algorithms.md List of 20 algorithms
- docs/setup-local.md Detailed installation guide for macOS
- docs/deploy.md Deployment with Docker Compose + Traefik/HTTPS
- docs/coding-standards.md Coding standards (Clean Code)
- docs/contributing.md Contribution and quality workflow
- docs/security.md Security considerations

Best practices
- Lint and formatting: ESLint + Prettier
- Commits: Conventional Commits
- Mandatory code review on PRs

License
- MIT (suggested)
