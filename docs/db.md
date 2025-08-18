# Esquema de datos

Entidades principales
- User
  - id (uuid)
  - email (único)
  - name
  - passwordHash
  - createdAt, updatedAt
  - Índices: email único

- Algorithm
  - id (uuid)
  - slug (único, estable)
  - name
  - category (sorting|search|graph|dp|string|math|greedy|tree|other)
  - difficulty (easy|medium|hard)
  - description
  - createdAt, updatedAt
  - Índices: slug único, category, difficulty

- UserAlgorithm (relación N:M)
  - id (uuid)
  - userId (FK -> User.id ON DELETE CASCADE)
  - algorithmId (FK -> Algorithm.id ON DELETE CASCADE)
  - learnedAt (datetime)
  - Restricción única: (userId, algorithmId)
  - Índices: userId, algorithmId

Relaciones
- User 1..* UserAlgorithm *..1 Algorithm

Migraciones
- Todas las modificaciones de esquema se realizan mediante migraciones versionadas.
- Orden recomendado
  1) create-users
  2) create-algorithms
  3) create-user-algorithms
  4) seed-algorithms-20-items (solo inserciones idempotentes por slug)

Semillas (seed)
- Lista de 20 algoritmos con slugs y metadatos en docs/algorithms.md.
- Seed debe ser idempotente: upsert por slug.

Ejemplo de consultas típicas
- Listar algoritmos aprendidos por usuario: join UserAlgorithm -> Algorithm filtrando por userId.
- Progreso: COUNT(UserAlgorithm WHERE userId = X) / 20.

Buenas prácticas de base de datos
- Usar transacciones al marcar aprendido/desmarcar para evitar condiciones de carrera.
- Validar entradas con niveles en app (DTOs) y constraints en DB.
- Evitar N+1 con relations y select optimizados.
- Añadir índices si aparecen cuellos de botella (p.ej., userId + algorithmId ya indexados).

