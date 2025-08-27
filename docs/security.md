# Security

Objective  
Define security controls for Algorithm Hub (Angular + NestJS, TypeORM, MariaDB) from development to production.

Authentication and Sessions
- JWT (HS256/HS512) with short expiration (e.g., 15–60 min). Optional aud/iss fields.
- Token storage on frontend: in memory. Avoid localStorage (XSS risk). Optionally use HttpOnly+Secure+SameSite=Lax cookie if configured in backend.
- Authorization header: Bearer <token> in all requests to protected routes.
- Rotation/Revocation: consider refresh token in a future iteration.

Passwords
- Hash with Argon2id (costs adjusted to server). Never store passwords in plain text.
- Minimum password policy (length, reasonable complexity) and lockout on attempts (rate limit per IP/user).

Validation and Sanitization
- DTOs with class-validator and class-transformer (whitelist: true, forbidNonWhitelisted: true).
- Input sanitization (escape/sanitize) and payload size limits.

HTTP Security
- Helmet enabled (includes X-Content-Type-Options, X-Frame-Options, etc.).
- CORS restricted to frontend domain and necessary methods.
- Rate limiting and basic anti-bruteforce protection on /auth.
- HSTS in production (behind HTTPS). Configure strict Content-Security-Policy.

Database
- DB user with minimum privileges for the app.
- Constraints and unique keys (email, slug) for integrity.
- Parameterized queries (TypeORM) to prevent injections.
- Regular backups and encryption at rest (as per infrastructure).

Secrets Management
- .env outside version control. Variables: JWT_SECRET, DB_*.
- Production: use a secrets manager (AWS Secrets Manager, Vault, etc.). Periodic rotation.

Logging and Monitoring
- Structured logs without sensitive PII. Redact tokens/passwords.
- Traceability with requestId/correlationId.
- Alerts on spikes of 401/403/5xx and DB errors.

Dependencies and CI/CD
- Regular audits (npm audit, osv-scanner) and continuous updates (Renovate).
- Secret scanning in PRs, SAST, and e2e tests in CI.
- Immutable build and container image signing/integrity verification.

Frontend
- Sanitize form inputs, avoid innerHTML.
- Use Interceptor to add Authorization and handle 401 centrally.
- Avoid exposing sensitive data in console or error messages.

Deployment Checklist
- [ ] HTTPS enabled (modern TLS) and HSTS
- [ ] CORS restricted
- [ ] Helmet + CSP configured
- [ ] Rate limiting active
- [ ] Secure variables and secrets (not in repo)
- [ ] DB user with minimum privileges
- [ ] Backups and monitoring configured

