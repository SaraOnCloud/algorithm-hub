# Coding Standards (Clean Code)

Objective  
Ensure maintainable, readable, and consistent code in Algorithm Hub (Angular + NestJS, strict TypeScript).

General Principles
- KISS, DRY, and SOLID
- Clear and specific names (domain and purpose)
- Small units: functions < 30 lines, cohesive classes
- Avoid redundant comments; prefer self-explanatory code
- Fail fast: validate early with DTOs and strict types

TypeScript
- "strict": true in tsconfig
- Type everything (parameters, returns, properties)
- Avoid any; use unknown and refine
- Prefer readonly types and immutability when applicable

Formatting and Linting
- ESLint + Prettier (consistent rules for frontend and backend)
- Scripts:
  - lint, lint:fix, format
- Pre-commit with Husky + lint-staged (partial formatting and linting)

Git and Commits
- Conventional Commits (feat, fix, chore, refactor, docs, test, perf, ci)
- Small, focused PRs, clear description, screenshots if applicable
- Rebase before merge, squash optional

Frontend (Angular)
- Structure by features (lazy modules when applicable)
- Dumb/smart components: presentation vs. container
- Injectable services for business logic and API access
- Use OnPush when possible; avoid unnecessary work in templates
- Interceptors for auth and error handling
- Guards for private routes
- No business logic in components; extract to services
- Avoid global state unless necessary; consider NgRx if scaling
- Accessibility (a11y), roles/labels, loading/error states

Backend (NestJS)
- Modules by domain (auth, users, algorithms, progress)
- Clear layers: Controller (I/O), Service (use cases), Repository (persistence)
- DTOs with class-validator/class-transformer; do not expose entities directly
- Nest exceptions (HttpException) and global filters for consistency
- ConfigModule with env validation (Joi/Zod)
- Typed TypeORM repositories; avoid raw queries unless necessary
- Idempotency in critical endpoints (mark as learned)

Database
- Versioned migrations; do not use synchronize in production
- Idempotent seeds by slug
- Constraints and indexes for integrity and performance
- Transactions when mutating N:M relationships

Testing
- Unit: services and utilities (Jest)
- e2e: critical endpoints (supertest)
- Suggested minimum coverage: 80%
- Double pyramid: backend and frontend with independent suites

Errors and Logging
- Centralized HTTP error handling
- Structured logs (pino) with levels; no sensitive PII
- Useful traces: requestId/correlationId

Security
- Argon2 for passwords, JWT with expiration
- Helmet, restricted CORS, rate limiting
- Strict input validation and sanitization

Performance
- Default pagination, pageSize limits
- Optional cache for static catalogs (algorithms)
- Avoid N+1; use necessary relations and selects

Code Review
- Checklist: clean lint, tests pass, clear names, no dead code, updated docs
- At least 1 approval before merging to main
