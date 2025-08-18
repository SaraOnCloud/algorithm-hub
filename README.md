# Algorithm Hub

Aplicación full-stack para aprender algoritmos. Frontend en Angular, backend en NestJS con TypeORM y MariaDB. Los usuarios pueden registrarse, explorar un catálogo de 20 algoritmos predefinidos, marcarlos como aprendidos y ver su progreso global.

Contenido clave
- Stack: Angular 17+, NestJS 10+, TypeScript, TypeORM, MariaDB 10.6+, JWT, ESLint, Prettier.
- Arquitectura: monorepo simple con carpetas frontend/ y backend/ y docs/.
- Calidad: Clean Code, SOLID, pruebas unitarias y e2e, CI/CD sugerido con GitHub Actions.

Estructura del repositorio
- frontend/ Aplicación Angular
- backend/ API NestJS (TypeORM + MariaDB)
- docs/ Documentación técnica y funcional
- README.md Este archivo

Requisitos
- Node.js LTS (>= 20)
- npm o pnpm (recomendado pnpm >= 9)
- MariaDB 10.6+ o Docker Desktop
- Angular CLI y Nest CLI (opcional para desarrollo):
  - npm i -g @angular/cli @nestjs/cli

Configuración rápida (local)
1) Base de datos
- Opción Docker: ver docs/deploy.md para docker-compose con MariaDB
- Opción local:
  - Crear base de datos algorithm_hub y usuario con permisos
2) Variables de entorno
- Backend: crear backend/.env con
  - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
  - JWT_SECRET, JWT_EXPIRES_IN
- Frontend: ajustar environments en Angular para API_URL
3) Instalación
- cd frontend && npm i
- cd backend && npm i
4) Migraciones y seed
- Ejecutar migraciones TypeORM
- Ejecutar seed inicial de 20 algoritmos
5) Ejecutar
- Backend: npm run start:dev
- Frontend: npm start

Características
- Registro e inicio de sesión con JWT
- Listado y detalle de 20 algoritmos predefinidos
- Marcar/desmarcar algoritmo como aprendido
- Cálculo de progreso global (aprendidos/total)

Documentación
- docs/architecture.md Arquitectura general y módulos
- docs/api.md Contrato de API REST
- docs/db.md Esquema de datos y entidades
- docs/algorithms.md Lista de 20 algoritmos
- docs/setup-local.md Guía detallada de instalación en macOS
- docs/deploy.md Despliegue con Docker Compose
- docs/coding-standards.md Estándares de código (Clean Code)
- docs/contributing.md Flujo de contribución y calidad
- docs/security.md Consideraciones de seguridad

Buenas prácticas
- Lint y formateo: ESLint + Prettier
- Commits: Conventional Commits
- Revisión de código obligatoria en PRs

Licencia
- MIT (sugerida)

