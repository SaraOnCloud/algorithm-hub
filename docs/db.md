# Data Schema

Main Entities
- User
  - id (uuid)
  - email (unique)
  - name
  - passwordHash
  - createdAt, updatedAt
  - Indexes: unique email

- Algorithm
  - id (uuid)
  - slug (unique, stable)
  - name
  - category (sorting|search|graph|dp|string|math|greedy|tree|other)
  - difficulty (easy|medium|hard)
  - description
  - createdAt, updatedAt
  - Indexes: unique slug, category, difficulty

- UserAlgorithm (N:M relationship)
  - id (uuid)
  - userId (FK -> User.id ON DELETE CASCADE)
  - algorithmId (FK -> Algorithm.id ON DELETE CASCADE)
  - learnedAt (datetime)
  - Unique constraint: (userId, algorithmId)
  - Indexes: userId, algorithmId

Relationships
- User 1..* UserAlgorithm *..1 Algorithm

Migrations
- All schema changes are performed via versioned migrations.
- Recommended order:
  1) create-users
  2) create-algorithms
  3) create-user-algorithms
  4) seed-algorithms-20-items (only idempotent inserts by slug)

Seeds
- List of 20 algorithms with slugs and metadata in docs/algorithms.md.
- Seed must be idempotent: upsert by slug.

Example Queries
- List algorithms learned by a user: join UserAlgorithm -> Algorithm filtering by userId.
- Progress: COUNT(UserAlgorithm WHERE userId = X) / 20.

Database Best Practices
- Use transactions when marking as learned/unlearned to avoid race conditions.
- Validate inputs at the app level (DTOs) and with DB constraints.
- Avoid N+1 with relations and optimized selects.
- Add indexes if bottlenecks appear (e.g., userId + algorithmId already indexed).
