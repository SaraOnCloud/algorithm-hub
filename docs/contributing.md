# Contribución

Gracias por tu interés en contribuir a Algorithm Hub. Este documento describe el flujo recomendado para colaborar, estándares y calidad.

Requisitos
- Node.js >= 20 y pnpm >= 9
- MariaDB local o vía Docker
- ESLint + Prettier, Husky configurado

Flujo de trabajo
1) Fork y branch por feature/fix
- git checkout -b feat/nombre-corto
2) Desarrollo
- Mantén cambios pequeños y atómicos
- Añade/actualiza pruebas y docs
3) Lint y pruebas
- pnpm lint && pnpm test
4) Commits convencionales
- feat: nueva funcionalidad
- fix: corrección de bug
- docs:, test:, chore:, refactor:, perf:, ci:
5) Pull Request
- Descripción clara, capturas si aplica
- Checklist: lint ok, tests ok, docs actualizadas
- Solicita revisión

Estándares
- Ver docs/coding-standards.md
- TypeScript estricto en frontend y backend
- DTOs con validación, no exponer entidades directamente

Pruebas
- Cobertura mínima sugerida 80%
- Backend: unit y e2e (supertest)
- Frontend: unit (componentes y servicios)

Revisiones
- Al menos 1 aprobación antes de merge
- Resolver comentarios antes de fusionar

Seguridad
- No incluir secretos en commits
- Reportar vulnerabilidades por canal privado (ver docs/security.md)

Hoja de ruta
- Issues etiquetados como good first issue para nuevos contribuidores
- Usa discusiones para propuestas de nuevas features

