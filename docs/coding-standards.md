# Estándares de código (Clean Code)

Objetivo
Asegurar un código mantenible, legible y consistente en Algorithm Hub (Angular + NestJS, TypeScript estricto).

Principios generales
- KISS, DRY y SOLID
- Nombres claros y específicos (dominio y propósito)
- Pequeñas unidades: funciones < 30 líneas, clases cohesivas
- Evitar comentarios redundantes; preferir código autoexplicativo
- Fail fast: validar temprano con DTOs y tipos estrictos

TypeScript
- "strict": true en tsconfig
- Tipar todo (parámetros, retornos, propiedades)
- Evitar any; usar unknown y refinar
- Preferir tipos readonly e inmutabilidad cuando aplique

Formateo y lint
- ESLint + Prettier (reglas consistentes en frontend y backend)
- Scripts:
  - lint, lint:fix, format
- Pre-commit con Husky + lint-staged (formateo y lint parcial)

Git y commits
- Conventional Commits (feat, fix, chore, refactor, docs, test, perf, ci)
- PRs pequeños y enfocados, descripción clara, capturas si aplica
- Rebase antes de merge, squash opcional

Frontend (Angular)
- Estructura por features (módulos lazy cuando aplique)
- Componentes dumb/smart: presentación vs. contenedor
- Servicios inyectables para lógica de negocio y acceso a API
- Usa OnPush cuando sea posible; evita trabajo innecesario en plantillas
- Interceptores para auth y manejo de errores
- Guards para rutas privadas
- No lógica de negocio en componentes; extraer a servicios
- Evitar estado global salvo necesidad; considerar NgRx si escala
- Accesibilidad (a11y), roles/labels, estados de carga/errores

Backend (NestJS)
- Módulos por dominio (auth, users, algorithms, progress)
- Capas claras: Controller (I/O), Service (casos de uso), Repository (persistencia)
- DTOs con class-validator/class-transformer; no exponer entidades directamente
- Excepciones de Nest (HttpException) y filtros globales para consistencia
- ConfigModule con validación de env (Joi/Zod)
- Repositorios TypeORM tipados; evitar consultas crudas salvo necesidad
- Idempotencia en endpoints críticos (marcar aprendido)

Base de datos
- Migraciones versionadas; no usar synchronize en producción
- Seeds idempotentes por slug
- Constraints e índices para integridad y performance
- Transacciones al mutar relaciones N:M

Pruebas
- Unit: servicios y utilidades (Jest)
- e2e: endpoints críticos (supertest)
- Cobertura mínima sugerida: 80%
- Doble pirámide: backend y frontend con suites independientes

Errores y logging
- Manejo centralizado de errores HTTP
- Logs estructurados (pino) con niveles; sin PII sensible
- Trazas útiles: requestId/correlationId

Seguridad
- Argon2 para contraseñas, JWT con expiración
- Helmet, CORS restringido, rate limiting
- Validación de entrada estricta y saneamiento

Rendimiento
- Paginación por defecto, límites de pageSize
- Cache opcional para catálogos estáticos (algorithms)
- Evitar N+1; usar relaciones y selects necesarios

Revisión de código
- Checklist: lint limpio, pruebas pasan, nombres claros, sin código muerto, docs actualizadas
- Al menos 1 aprobación antes de merge a main

