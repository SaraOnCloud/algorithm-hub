# Contribution

Thank you for your interest in contributing to Algorithm Hub. This document outlines the recommended workflow, standards, and quality guidelines.

Requirements
- Node.js >= 20 and pnpm >= 9
- Local MariaDB or via Docker
- ESLint + Prettier, Husky configured

Workflow
1) Fork and create a branch per feature/fix
- git checkout -b feat/short-name
2) Development
- Keep changes small and atomic
- Add/update tests and docs
3) Lint and tests
- pnpm lint && pnpm test
4) Conventional commits
- feat: new feature
- fix: bug fix
- docs:, test:, chore:, refactor:, perf:, ci:
5) Pull Request
- Clear description, screenshots if applicable
- Checklist: lint ok, tests ok, docs updated
- Request review

Standards
- See docs/coding-standards.md
- Strict TypeScript in frontend and backend
- DTOs with validation, do not expose entities directly

Testing
- Suggested minimum coverage 80%
- Backend: unit and e2e (supertest)
- Frontend: unit (components and services)

Reviews
- At least 1 approval before merging
- Resolve comments before merging

Security
- Do not include secrets in commits
- Report vulnerabilities via private channel (see docs/security.md)

Roadmap
- Issues labeled as good first issue for new contributors
- Use discussions for new feature proposals


