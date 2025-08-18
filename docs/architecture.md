# Arquitectura de Algorithm Hub

Objetivo
Aplicación full‑stack para aprender algoritmos, con frontend en Angular y backend en NestJS. Persistencia con TypeORM sobre MariaDB. Autenticación JWT. Se prioriza Clean Code, SOLID, pruebas automatizadas y DX.

Visión general
- Frontend (Angular): SPA que permite registro/login, listar 20 algoritmos predefinidos, marcar como aprendido y ver progreso global.
- Backend (NestJS): API REST con módulos de auth, usuarios, algoritmos y progreso. TypeORM gestiona entidades, migraciones y seed inicial.
- Base de datos (MariaDB): Esquema normalizado con Users, Algorithms y UserAlgorithms (tabla de unión).

Estructura del repositorio (monorepo simple)
- frontend/ Aplicación Angular
  - src/app/
    - core/ (servicios transversales: auth, http, interceptors)
    - shared/ (componentes y utilidades compartidas)
    - features/
      - auth/
      - algorithms/
      - progress/
    - app-routing.module.ts
- backend/ API NestJS
  - src/
    - app.module.ts
    - config/ (configuración y validación env)
    - common/ (pipes, filters, interceptors, decorators)
    - modules/
      - auth/
      - users/
      - algorithms/
      - progress/ (o user-algorithms)
    - database/
      - entities/
      - migrations/
      - seeds/
- docs/ Documentación

Frontend (Angular)
- Versiones: Angular 17+, TypeScript estricto.
- State: Servicios inyectables; NgRx opcional si el estado crece.
- Rutas principales:
  - /auth (login/registro)
  - /algorithms (listado y detalle)
  - /progress (resumen global)
- Módulos por feature, lazy-loading cuando aplique.
- Servicios clave:
  - AuthService: login, register, refresh (si aplica), gestión de token en memoria/Storage.
  - AlgorithmsService: list, getById, toggleLearned.
  - ProgressService: resumen y lista de aprendidos.
- Interceptores:
  - AuthInterceptor: añade Authorization: Bearer <token>.
  - HttpErrorInterceptor: manejo uniforme de errores.
- Guards: AuthGuard para rutas protegidas.
- UI/UX: componentes accesibles, feedback de carga/errores.
- Testing: Jest o Karma + Jasmine. Pruebas de componentes y servicios.

Backend (NestJS)
- Versiones: NestJS 10+, TypeScript estricto.
- Módulos:
  - AuthModule: registro, login, JWT. Hash con Argon2.
  - UsersModule: perfil del usuario autenticado.
  - AlgorithmsModule: CRUD limitado (solo lectura pública; administración futura opcional).
  - ProgressModule: operaciones sobre aprendizaje de algoritmos por usuario.
- Capas por módulo:
  - Controller: contratos HTTP y validación con DTOs (class-validator/class-transformer).
  - Service: casos de uso y orquestación.
  - Repository: acceso a datos con TypeORM (repositorios por entidad).
- Configuración:
  - ConfigModule global. Validación de env con Joi o Zod.
  - Prefix global /api/v1. CORS habilitado para frontend.
- Persistencia:
  - Entidades: User, Algorithm, UserAlgorithm (ManyToMany con payload learnedAt).
  - Migraciones versionadas y seed inicial de 20 algoritmos.
- Seguridad:
  - JWT Access Token. Helmet, rate limiting, CORS restringido.
  - Hash de contraseñas con Argon2, política de contraseñas y validaciones fuertes.
- Observabilidad:
  - Logger de Nest (p.ej., Pino con nestjs-pino). Filtros de excepciones.
- Testing:
  - Unit tests por servicio/controlador. e2e con supertest.

Flujos principales
- Registro/login: usuario obtiene JWT y accede a rutas protegidas.
- Listado de algoritmos: consulta paginada/filtrada.
- Marcar como aprendido: inserta en UserAlgorithm (o borra para desmarcar).
- Progreso global: (aprendidos/20) en porcentaje y conteos.

Migrations y seeds
- Migraciones para crear tablas e índices.
- Seed para insertar los 20 algoritmos con claves estables (slugs) y metadatos.

Calidad y DX
- ESLint + Prettier. tsconfig strict.
- Husky + lint-staged para pre-commit.
- Conventional Commits + changelog automático opcional.

Riesgos y mitigaciones
- Consistencia de datos: constraints y transacciones al marcar aprendido.
- N+1 queries: usar relaciones y select adecuados.
- Escalabilidad: cache selectiva para listado de algoritmos (opcional).

