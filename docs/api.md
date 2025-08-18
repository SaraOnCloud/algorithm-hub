# API de Algorithm Hub

Base
- URL base: /api/v1
- Autenticación: JWT en Authorization: Bearer <token>
- Formato: JSON

Auth
- POST /auth/register
  - body: { email, password, name }
  - 201: { user: { id, email, name }, accessToken }
  - 400/409: validación o email duplicado
- POST /auth/login
  - body: { email, password }
  - 200: { user: { id, email, name }, accessToken }
  - 401: credenciales inválidas

Algoritmos
- GET /algorithms
  - query: search?, category?, page=1, pageSize=20
  - 200: { items: Algorithm[], page, pageSize, total }
- GET /algorithms/:slug
  - 200: Algorithm
  - 404: no encontrado

Progreso (rutas protegidas)
- GET /me/progress
  - 200: { learned: number, total: number, percent: number }
- GET /me/algorithms
  - 200: { learned: Algorithm[] }
- POST /me/algorithms/:slug/learn
  - 201: { slug, learnedAt }
  - Idempotente: si ya estaba aprendido, retorna 200/204
- DELETE /me/algorithms/:slug/learn
  - 204 sin contenido; si no existía, 204 igualmente

Esquemas
- Algorithm
  - { id, slug, name, category, difficulty, description }
- Error
  - { statusCode, message, error }

Códigos y errores
- 200/201/204 éxito; 400 validación; 401 auth; 403 permisos; 404 no existe; 409 conflicto; 500 error interno.

Paginación
- page y pageSize (máx recomendado 50). Respuesta incluye total para calcular páginas.

Filtros
- search: texto en nombre/slug/descripcion
- category: sorting|search|graph|dp|string

Notas
- Tiempos en ISO-8601 UTC.
- Versionado: prefijo /api/v1.

