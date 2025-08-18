# Seguridad

Objetivo
Definir controles de seguridad para Algorithm Hub (Angular + NestJS, TypeORM, MariaDB) desde el desarrollo hasta producción.

Autenticación y sesiones
- JWT (HS256/HS512) con expiración corta (ej. 15–60 min). Campo aud/iss opcional.
- Almacenamiento del token en frontend: en memoria. Evitar localStorage (riesgo XSS). Opcional cookie HttpOnly+Secure+SameSite=Lax si se configura en backend.
- Cabecera Authorization: Bearer <token> en todas las peticiones a rutas protegidas.
- Rotación/Revocación: considerar refresh token en una iteración futura.

Contraseñas
- Hash con Argon2id (costes ajustados a servidor). No guardar contraseñas en texto plano.
- Política de contraseñas mínimas (longitud, complejidad razonable) y bloqueo por intentos (rate limit por IP/usuario).

Validación y saneamiento
- DTOs con class-validator y class-transformer (whitelist: true, forbidNonWhitelisted: true).
- Saneamiento de entradas (escape/sanitize) y límites de tamaño en payloads.

Seguridad HTTP
- Helmet habilitado (incluye X-Content-Type-Options, X-Frame-Options, etc.).
- CORS restringido al dominio del frontend y métodos necesarios.
- Rate limiting y protección básica anti-bruteforce en /auth.
- HSTS en producción (detrás de HTTPS). Configurar Content-Security-Policy estricta.

Base de datos
- Usuario de DB con privilegios mínimos para la app.
- Constraints y claves únicas (email, slug) para integridad.
- Queries parametrizadas (TypeORM) para prevenir inyecciones.
- Backups periódicos y cifrado en reposo (según infraestructura).

Gestión de secretos
- .env fuera del control de versiones. Variables: JWT_SECRET, DB_*.
- Producción: usar gestor de secretos (AWS Secrets Manager, Vault, etc.). Rotación periódica.

Logs y monitoreo
- Logs estructurados sin PII sensible. Redactar tokens/contraseñas.
- Trazabilidad con requestId/correlationId.
- Alertas ante picos de 401/403/5xx y errores de DB.

Dependencias y CI/CD
- Auditorías periódicas (npm audit, osv-scanner) y actualización continua (Renovate).
- Escaneo de secretos en PRs, SAST y pruebas e2e en CI.
- Build inmutable y firmas/verificación de integridad de imágenes de contenedor.

Frontend
- Sanitizar entradas en formularios, evitar innerHTML.
- Uso de Interceptor para añadir Authorization y manejar 401 de forma centralizada.
- Evitar exponer datos sensibles en consola o mensajes de error.

Checklist de despliegue
- [ ] HTTPS habilitado (TLS moderno) y HSTS
- [ ] CORS restringido
- [ ] Helmet + CSP configurados
- [ ] Rate limiting activo
- [ ] Variables y secretos seguros (no en repo)
- [ ] Usuario DB con privilegios mínimos
- [ ] Backups y monitoreo configurados

