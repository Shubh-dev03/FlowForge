# FlowForge

A workflow automation platform for defining, executing, and monitoring structured workflows.

## V1 goal

Build a secure, deployable workflow automation application that demonstrates practical backend engineering, relational data modeling, workflow execution, real-time updates, testing, and containerized deployment.

## V1 features

- User registration, login, refresh, and logout.
- User-owned workflows; each user can own multiple workflows.
- Workflow CRUD using structured forms, not a visual canvas.
- Manual trigger.
- Initial step types: log a message and evaluate a condition.
- Conditions use field/operator/value comparisons with explicit true and false branches.
- Execution starts asynchronously from the HTTP request and returns an execution ID.
- Persisted execution status and step-by-step history.
- Live progress via Socket.IO.
- Cooperative cancellation at safe checkpoints.
- Backend workflow validation and security controls.
- Automated tests, OpenAPI documentation, Docker, and lightweight CI.

## V1 execution behavior

- PostgreSQL is the source of truth; WebSockets deliver updates, and clients refetch persisted state after reconnecting.
- V1 uses a separate in-process runner; automatic recovery after a server crash is not guaranteed.
- A failed step stops the workflow and records the failure where possible.
- Cancellation may wait for a currently running step and does not undo completed side effects.
- Multiple independent runs are allowed. An idempotency key prevents duplicate execution records for repeated submissions using the same key.
- New runs use the latest saved definition. Full workflow version history is not included.

## Stack

- Frontend: React, TypeScript, React Router, TanStack Query, React Hook Form, Zod, Tailwind CSS, shadcn/ui.
- Backend: Node.js, Express, TypeScript, Zod, Socket.IO, Pino.
- Database: PostgreSQL, Drizzle ORM, Drizzle Kit migrations.
- Tests: Vitest, Supertest, dedicated PostgreSQL test database.
- API docs: OpenAPI and Swagger UI.
- Delivery: Docker and GitHub Actions for lint, type checks, tests, and build checks.

Redis + BullMQ are deferred from V1.

## Repository layout

```text
FlowForge/
├── frontend/
├── backend/
├── Docs/
│   ├── README_ARCHITECTURE_DECISIONS.md
│   ├── README_ROADMAP_REQUIREMENTS_TESTS.md
│   └── README_AI_DEVELOPMENT_RULES.md
├── README.md
├── V2-readme.md
└── .gitignore
```

## Documentation

- [Architecture decisions](Docs/README_ARCHITECTURE_DECISIONS.md)
- [Roadmap, requirements, and tests](Docs/README_ROADMAP_REQUIREMENTS_TESTS.md)
- [AI-assisted development rules](Docs/README_AI_DEVELOPMENT_RULES.md)
