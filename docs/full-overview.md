# Algorithm Hub – System Explanation

> This document explains how the system works: Docker / Traefik infrastructure, backend (NestJS + TypeORM + Auth + Email), and frontend (Angular). Purely descriptive (no improvement proposals).

## Table of Contents
1. Architecture Overview
2. Docker & Traefik Infrastructure
3. Environment Variables
4. Backend (NestJS)
   - 4.1 Bootstrap & Core Behavior
   - 4.2 Modules
   - 4.3 Rate Limiting
   - 4.4 Authentication Flow
   - 4.5 Mailer
   - 4.6 Data Model (Entities)
   - 4.7 Progress Logic
   - 4.8 Seed Data
5. REST API v1 Endpoints
6. Security Mechanisms (Descriptive)
7. Frontend (Angular)
   - 7.1 Bootstrap (Standalone Setup)
   - 7.2 Routing & Lazy Loading
   - 7.3 Client Auth State
   - 7.4 HTTP Interceptors
   - 7.5 Route Guard
   - 7.6 State Persistence
   - 7.7 Service Layer Contracts
   - 7.8 Components & Folder Roles
   - 7.9 Environment Configuration
   - 7.10 Error Handling (Current)
8. Registration / Verification Lifecycle
9. Learning Tracking Flow
10. Production Deployment (What Happens)
11. Local Development Workflow
12. Troubleshooting (Observed Causes)

---
## 1. Architecture Overview
The system consists of:
- Frontend: Angular compiled assets served by Nginx.
- Backend: NestJS API (Node.js) with TypeORM and MariaDB.
- Database: MariaDB container (or external RDBMS) plus optional phpMyAdmin UI.
- Reverse Proxy: Traefik providing HTTP→HTTPS redirection, TLS termination and routing.
- Communication: JSON REST API under `/api/v1`.

## 2. Docker & Traefik Infrastructure
`docker-compose.yml` defines services:
- `db`: MariaDB 10.6 with persistent volume.
- `phpmyadmin`: Web UI to inspect the database.
- `backend`: Node/NestJS service exposing port 3000 internally.
- `frontend`: Nginx serving built Angular files.
- `traefik`: Reverse proxy listening on ports 80/443 and routing based on host + path rules.

Routing behavior:
- Requests with path beginning `/api` and matching host go to backend.
- Other root path requests go to frontend (static files / index.html for SPA).

Networks:
- `internal`: Shared application network.
- `traefik`: Network used by Traefik to reach backend/frontend containers.

## 3. Environment Variables
Validated at startup. Purpose of principal variables:
- `PORT`: Port the NestJS server listens on.
- `DB_*`: Connection credentials for MariaDB/MySQL.
- `JWT_SECRET` / `JWT_EXPIRES_IN`: JWT signing secret and token lifetime.
- `EMAIL_USER` / `EMAIL_PASS`: SMTP auth (Gmail service in current setup). If absent, email sending is disabled.
- `EMAIL_FROM`, `EMAIL_FROM_NAME`: Sender identity for outgoing verification emails.
- `DOMAIN`: Public domain used to build absolute verification links.
- `NODE_ENV`: Influences logging and CORS policy.

## 4. Backend (NestJS)
### 4.1 Bootstrap & Core Behavior
`main.ts` sets:
- Global prefix: `/api/v1`.
- CORS: Accepts localhost origins in development; domain-based origins in production.
- Global `ValidationPipe`: Sanitizes and validates incoming DTOs (removes unknown fields and rejects forbidden ones).

### 4.2 Modules
- `AuthModule`: Handles user registration, login, email verification and token resend.
- `AlgorithmsModule`: Provides public listing and retrieval of algorithm metadata.
- `ProgressModule`: Manages a user’s learned algorithms and reports progress.
- `MailerModule`: Wraps Nodemailer; only active if credentials are present.

### 4.3 Rate Limiting
Implemented with `@nestjs/throttler`:
- A global policy (100 requests / 60s window) via a global guard.
- Specific custom limits for sensitive endpoints (register, login, verify, resend) through `@Throttle` decorator.

### 4.4 Authentication Flow
- Users register with email, password and name.
- Passwords are hashed using Argon2.
- Email verification token (random 32 bytes hex) stored on user.
- Login allowed only if `isEmailVerified` is true.
- JWT payload structure: `{ sub: <userId>, email, name }`.
- Bearer token extracted from `Authorization` header by Passport JWT strategy.

### 4.5 Mailer
- Transporter uses Gmail service configuration if credentials provided.
- Verification URL shape: `https://<DOMAIN>/api/v1/auth/verify?token=<hex>` (or `http://localhost:3000` in local environment).
- If mailer disabled, calls to send emails exit silently (no error thrown).

### 4.6 Data Model (Entities)
1. `User`:
   - `email` (unique), `name`, `passwordHash`.
   - `isEmailVerified`, `emailVerificationToken`, `emailVerificationSentAt`.
   - Timestamps: `createdAt`, `updatedAt`.
2. `Algorithm`:
   - `slug` (unique identifier used in URLs).
   - `name`, `category`, `difficulty`, optional `description`.
   - Timestamps plus inverse relations to learned associations.
3. `UserAlgorithm` (relation table):
   - Links a `User` and an `Algorithm` uniquely.
   - `learnedAt`: timestamp of acquisition/reactivation.
   - `active`: boolean indicating whether the user currently marks it as learned.

### 4.7 Progress Logic
- Learned count = number of active `UserAlgorithm` rows for the user.
- Total algorithms = count of `Algorithm` table.
- Percentage = (learned / total) rounded to whole integer.
- Learn action either creates a new row or reactivates an inactive one, updating `learnedAt`.
- Unlearn action sets `active = false` (row retained for potential future reactivation).

### 4.8 Seed Data
- A predefined set of algorithm definitions (sorting, graph, DP, string, greedy, tree categories) used to populate base catalog when seeding logic runs.

## 5. REST API v1 Endpoints
Base path: `/api/v1`

Auth:
- `POST /auth/register`: Create user and send verification email.
- `POST /auth/login`: Return JWT on valid credentials and verified email.
- `GET /auth/verify?token=...`: Validate and activate user email.
- `POST /auth/resend-verification`: Issue a new verification token if still unverified.

Algorithms:
- `GET /algorithms`: Optional query params (`search`, `category`, `page`, `pageSize`). Returns paginated listing.
- `GET /algorithms/:slug`: Return algorithm details by slug.

Progress (JWT required):
- `GET /me/progress`: Return learned, total, percent.
- `GET /me/algorithms`: List of currently active learned algorithms.
- `POST /me/algorithms/:slug/learn`: Create/reactivate learning relation for a slug.
- `DELETE /me/algorithms/:slug/learn`: Deactivate learned relation (idempotent).

## 6. Security Mechanisms (Descriptive)
- Input validation & transformation using class-validator / class-transformer.
- Rate limiting to mitigate brute force or abuse.
- Password hashing with Argon2 (memory-hard function).
- Email ownership check enforced through verification token.
- JWT-based stateless session: client presents token on each protected request.
- CORS origin filtering based on environment.
- Basic security headers applied by Traefik middleware.

## 7. Frontend (Angular)
### 7.1 Bootstrap (Standalone Setup)
- Uses Angular standalone APIs: `app.config.ts` registers router and HTTP client with interceptors.
- No traditional root NgModule; reduces boilerplate.

### 7.2 Routing & Lazy Loading
- `app.routes.ts` defines routes.
- Root redirect to `/algorithms`.
- Auth pages under `/auth` (login, register) loaded lazily via `loadComponent`.
- Algorithm routes: specific slugs map to custom visualization components; generic `:slug` fallback for standard details.
- `/progress` guarded and accessible only when authenticated.

### 7.3 Client Auth State
- `AuthService` stores user object and JWT token in `localStorage`.
- Reactive user state exposed through a `BehaviorSubject` (`user$`).
- Logout clears both entries and resets the subject.

### 7.4 HTTP Interceptors
- `authInterceptor`: Adds `Authorization: Bearer <token>` when a token is present.
- `errorInterceptor`: Present as a pass-through placeholder (no transformation yet).

### 7.5 Route Guard
- `authGuard` checks `AuthService.isAuthenticated`.
- If not authenticated, navigates to `/auth/login` and blocks route activation.

### 7.6 State Persistence
- Auth token and user profile survive page reload via `localStorage` retrieval on service initialization.
- In-memory subject allows Angular components to react to login/logout changes.

### 7.7 Service Layer Contracts
- `auth.service.ts`: Implements `register` and `login` (returns typed responses) plus `logout` (client-only cleanup).
- `algorithms.service.ts`: Provides `list` with dynamic `HttpParams` and `get` by slug.
- `progress.service.ts`: Exposes progress summary, learned list, learn and unlearn operations; enriches response with a `Set` of slugs for quick lookup.

### 7.8 Components & Folder Roles
- `core/`: Shared singleton logic (auth, HTTP interceptors, guards, services, theme service).
- `features/`: Route-bound UI components (auth forms, algorithm list, detail pages, progress view, custom algorithm visualizations).
- `ui/`: Reusable presentational components (buttons, inputs, cards, badge, spinner).
- `theme/`: Theme service (e.g. light/dark toggle responsibility).
- `features/algorithms/custom/`: Specialized algorithm visualization or explanation components.

### 7.9 Environment Configuration
- `environment.development.ts` vs `environment.ts` differentiate API base URL.
- Services read `environment.apiBaseUrl`; must point to backend prefix `/api/v1`.
- In development typically `http://localhost:3000/api/v1`.

### 7.10 Error Handling (Current)
- Central error interceptor currently passes responses unchanged.
- Components are responsible for handling and displaying errors until a centralized strategy is implemented.

## 8. Registration / Verification Lifecycle
1. User submits registration data.
2. Backend creates user with verification token and unverified status.
3. Email (if enabled) contains verification link referencing the token.
4. User requests verification endpoint; backend marks email as verified and clears token.
5. User can now authenticate and receive a JWT.

## 9. Learning Tracking Flow
1. User (authenticated) issues learn request for an algorithm slug.
2. Backend finds algorithm; creates or reactivates `UserAlgorithm` with current timestamp.
3. Progress endpoints compute counts and percentage from persistent relations.
4. Unlearn marks the relation as inactive (retaining historical row for future reactivation).

## 10. Production Deployment (What Happens)
- Traefik listens on ports 80/443, acquires/serves TLS certificates, and routes traffic.
- Frontend container serves static Angular build via Nginx.
- Backend container serves API on port 3000 (internal) consumed through Traefik.
- Database persists data on mounted volume; phpMyAdmin offers optional inspection interface.

## 11. Local Development Workflow
Steps (Docker-based):
1. Create `.env` in backend with required variables.
2. Run `docker compose up --build`.
3. Access API at `http://localhost:3000/api/v1`.
4. Run Angular dev server separately if desired (instead of Docker frontend) for hot reload.

Standalone (without Docker):
- Backend: `npm install` then `npm run start:dev` (requires running MariaDB/MySQL and matching env vars).
- Frontend: `npm install` then `npm run start` (Angular dev server on its default port, calling API at backend base URL).

## 12. Troubleshooting (Observed Causes)
| Symptom | Likely Cause | Description |
|---------|-------------|-------------|
| 401 during login | Unverified email | Login path checks `isEmailVerified` flag. |
| 401 on `/me/...` | Missing or invalid JWT | `Authorization: Bearer` header required. |
| 404 on learn action | Unknown algorithm slug | Slug not found in `algorithms` table. |
| No verification email | Mailer disabled | Missing `EMAIL_USER` / `EMAIL_PASS`. |
| No HTTPS | Traefik not set or DNS mismatch | Domain not pointing to server or ports blocked. |
| Frontend cannot reach API | Wrong `apiBaseUrl` | Environment file not matching backend URL. |

---
**End of descriptive system document.**
