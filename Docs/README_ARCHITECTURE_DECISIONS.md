# FlowForge Architecture Decisions

This document records agreed choices. If a choice changes, document the reason and impact rather than silently diverging.

## Product and workflow model

- **Editor:** Structured forms in V1, not a drag-and-drop canvas.
- **Trigger:** Manual trigger first; webhook trigger deferred.
- **Initial step types:** Log a message and evaluate a condition.
- **Conditions:** Field/operator/value comparisons with explicit true and false branches; no custom expressions.
- **Ownership:** User-owned workflows, multiple workflows per user; shared team workflows deferred.
- **Deferred actions:** HTTP request and delay actions.

## Authentication and security

- JWT-based authentication.
- Access JWT lifetime: 15 minutes; keep it in frontend memory, not localStorage.
- Refresh token in an HttpOnly, Secure cookie in production, with appropriate SameSite and CSRF protections.
- Rotate refresh tokens on use, revoke on logout, and detect refresh-token reuse.
- Validate JWT signature, expiry, and permitted algorithm.
- Existing access JWTs may remain valid until expiry unless a separate revocation mechanism is implemented.
- Hash passwords using Argon2id.
- Use Helmet, rate limits on login/sensitive endpoints, strict configured CORS, request-size limits, and Zod validation.
- Require HTTPS in production; keep secrets out of Git.
- Enforce ownership authorization for every protected workflow/execution resource.
- Return safe errors without stack traces or secrets.
  Security is layered; these controls reduce risk but cannot guarantee the application will never be compromised.

## Stack

- Frontend: React + TypeScript, React Router, TanStack Query, React Hook Form + Zod, Tailwind CSS + shadcn/ui.
- Backend: Node.js + Express + TypeScript, Zod, Socket.IO, Pino.
- Database: PostgreSQL; Drizzle ORM and committed Drizzle Kit migrations.
- Tests: Vitest + Supertest + dedicated PostgreSQL test database.
- API docs: OpenAPI + Swagger UI.
- Delivery: Docker and GitHub Actions for lint, type checks, tests, and build.

## Backend structure

Use a **modular monolith with pragmatic Clean Architecture**. Organize feature modules such as auth, workflows, and executions. Controllers handle HTTP; services/use cases contain business rules; repositories are used where they clarify persistence. Avoid unnecessary abstraction and premature microservices.

## Workflow definition

- Store flexible steps, conditions, and branches in PostgreSQL JSONB.
- Keep owner, name, and timestamps in relational columns.
- Validate requests and workflow definitions with backend Zod schemas before saving and executing.
- Enforce limits for maximum steps, branching depth, definition size, allowed operators, and supported input types. Choose numeric limits during implementation and cover them with tests.
- Keep executions and step history in relational tables.

## Execution and consistency

- Starting a run authorizes access, validates the definition, creates a persistent execution record and initial state in a short transaction, returns an execution ID, then processes the workflow separately from the initiating HTTP request.
- V1 uses a separate in-process runner. Redis/BullMQ and guaranteed automatic crash recovery are not included.
- Statuses: `pending`, `running`, `completed`, `failed`, `cancelled`.
- A failed step stops the workflow; persist the failure and safe error details where possible, then mark the execution `failed`.
- Cancellation is cooperative at safe checkpoints. A running step may finish before cancellation; completed side effects are not undone.
- Allow concurrent independent executions. Use an idempotency key to prevent duplicate execution records from repeated submissions with the same key; a new key means a new intentional run.
- New runs use the latest saved definition. Full version history is deferred. Each execution must retain enough information to identify what actually ran; finalize the exact snapshot strategy during database design.
- Use short PostgreSQL transactions for related state changes. Never hold a transaction open throughout workflow execution or WebSocket communication.

## History and observability

Persist overall execution status/timestamps and applicable per-step status/timestamps, condition result, selected branch, log message, and safe error details. Never log passwords, tokens, or secrets. Include request/execution IDs in structured logs where appropriate.

## Real-time updates

Use Socket.IO and execution-specific rooms. Authenticate connections and authorize room joins using ownership. PostgreSQL remains the source of truth; clients refetch persisted state after reconnecting.

## Errors, environments, and deployment

- Centralized Express error-handling middleware and consistent safe error responses.
- Separate development, testing, and production configuration/credentials.
- Provide `.env.example` placeholders, never real secrets.
- Use a dedicated PostgreSQL test database.
- Deploy frontend and backend separately where practical; database must be persistent and separately managed.
- GitHub Actions checks lint, types, tests, and build. Production deployment can remain manual for V1.
