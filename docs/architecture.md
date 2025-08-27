# Arquitectura de Algorithm Hub

Objective  
Full-stack application for learning algorithms, with Angular frontend and NestJS backend. Persistence with TypeORM on MariaDB. JWT authentication. Emphasis on Clean Code, SOLID, automated testing, and DX.

Overview  
- Frontend (Angular): SPA allowing registration/login, listing 20 predefined algorithms, marking as learned, and viewing global progress.
- Backend (NestJS): REST API with modules for auth, users, algorithms, and progress. TypeORM manages entities, migrations, and initial seed.
- Database (MariaDB): Normalized schema with Users, Algorithms, and UserAlgorithms (join table).

Repository structure (simple monorepo)
- frontend/ Angular application
  - src/app/
    - core/ (cross-cutting services: auth, http, interceptors)
    - shared/ (shared components and utilities)
    - features/
      - auth/
      - algorithms/
      - progress/
    - app-routing.module.ts
- backend/ NestJS API
  - src/
    - app.module.ts
    - config/ (env configuration and validation)
    - common/ (pipes, filters, interceptors, decorators)
    - modules/
      - auth/
      - users/
      - algorithms/
      - progress/ (or user-algorithms)
    - database/
      - entities/
      - migrations/
      - seeds/
- docs/ Documentation

Frontend (Angular)
- Versions: Angular 17+, strict TypeScript.
- State: Injectable services; NgRx optional if state grows.
- Main routes:
  - /auth (login/register)
  - /algorithms (list and detail)
  - /progress (global summary)
- Feature modules, lazy-loading when applicable.
- Key services:
  - AuthService: login, register, refresh (if applicable), token management in memory/Storage.
  - AlgorithmsService: list, getById, toggleLearned.
  - ProgressService: summary and list of learned algorithms.
- Interceptors:
  - AuthInterceptor: adds Authorization: Bearer <token>.
  - HttpErrorInterceptor: uniform error handling.
- Guards: AuthGuard for protected routes.
- UI/UX: accessible components, loading/error feedback.
- Testing: Jest or Karma + Jasmine. Component and service tests.

Backend (NestJS)
- Versions: NestJS 10+, strict TypeScript.
- Modules:
  - AuthModule: registration, login, JWT. Hashing with Argon2.
  - UsersModule: authenticated user profile.
  - AlgorithmsModule: limited CRUD (public read-only; future admin optional).
  - ProgressModule: operations on user algorithm learning.
- Layers per module:
  - Controller: HTTP contracts and validation with DTOs (class-validator/class-transformer).
  - Service: use cases and orchestration.
  - Repository: data access with TypeORM (entity repositories).
- Configuration:
  - Global ConfigModule. Env validation with Joi or Zod.
  - Global prefix /api/v1. CORS enabled for frontend.
- Persistence:
  - Entities: User, Algorithm, UserAlgorithm (ManyToMany with learnedAt payload).
  - Versioned migrations and initial seed of 20 algorithms.
- Security:
  - JWT Access Token. Helmet, rate limiting, restricted CORS.
  - Password hashing with Argon2, password policy, and strong validations.
- Observability:
  - Nest logger (e.g., Pino with nestjs-pino). Exception filters.
- Testing:
  - Unit tests per service/controller. e2e with supertest.

Main flows
- Registration/login: user obtains JWT and accesses protected routes.
- Algorithm listing: paginated/filtered query.
- Mark as learned: inserts into UserAlgorithm (or deletes to unmark).
- Global progress: (learned/20) as percentage and counts.

Migrations and seeds
- Migrations to create tables and indexes.
- Seed to insert 20 algorithms with stable keys (slugs) and metadata.

Quality and DX
- ESLint + Prettier. Strict tsconfig.
- Husky + lint-staged for pre-commit.
- Conventional Commits + optional automatic changelog.

Risks and mitigations
- Data consistency: constraints and transactions when marking as learned.
- N+1 queries: use proper relations and selects.
- Scalability: selective cache for algorithm listing (optional).
