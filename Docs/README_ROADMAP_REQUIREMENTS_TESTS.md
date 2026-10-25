# FlowForge Roadmap, Requirements, and Tests

## V1 objective
Deliver a secure, deployable workflow automation app where authenticated users configure simple workflows, run them, and inspect persistent step-by-step progress.

## Requirements
### Authentication and authorization
- Register, log in, refresh session, and log out.
- Hash passwords with Argon2id.
- Require authentication for protected APIs.
- Users can access only their own workflows and executions.
- Apply the token handling and security rules in `README_ARCHITECTURE_DECISIONS.md`.

### Workflow management
- Users can create multiple workflows and list, view, update, and delete only their own workflows.
- Configure through structured forms.
- Support manual trigger, log action, condition, and explicit true/false branches.
- Validate definitions on the backend and reject invalid or over-limit definitions.

### Execution and monitoring
- Starting a run creates a persistent execution and returns an ID without waiting for completion.
- Persist execution and step state.
- A failed step stops the workflow and records failure where possible.
- Cancellation is cooperative at safe checkpoints.
- Same idempotency key prevents duplicate execution records; independent runs remain allowed.
- Socket.IO provides live updates only to authorized clients.
- After reconnect, clients refetch persisted state.
- V1 does not guarantee automatic recovery after a server crash.

### Engineering and delivery
- Schema changes use committed migrations.
- Document APIs with OpenAPI.
- Run automated tests against a dedicated PostgreSQL test database.
- CI checks lint, TypeScript, tests, and build.
- Use environment-specific secrets and configuration.

## Out of scope for V1
Redis/BullMQ durable processing and automatic recovery; automatic retries; failure fallback paths; manual retry/resume; webhook triggers; HTTP and delay actions; shared team workflows; full workflow version history UI; visual editor; AI-generated workflows, machine learning, and broad integration marketplace. See `../V2-readme.md`.

## Suggested implementation phases
1. **Repository hygiene:** Confirm docs and `.gitignore`, commit project documentation, configure GitHub remote if desired.
2. **Backend foundation:** Initialize Express/TypeScript, linting, environment loading, centralized errors, Pino, health endpoint, and a basic test.
3. **Database:** Configure PostgreSQL/Drizzle, migrations, and isolated test database.
4. **Authentication:** Registration/login/refresh/logout, Argon2id, JWT validation, refresh rotation/revocation, rate limits, CORS, security headers.
5. **Workflow CRUD:** Ownership, JSONB definition, Zod schemas, documented definition limits.
6. **Execution engine:** Persistent execution creation, in-process runner, log step, condition branches, history, idempotency, cancellation, stop-on-failure.
7. **Real-time monitoring:** Socket.IO authentication, room ownership checks, progress events, reconnect/refetch.
8. **Frontend:** Auth pages, workflow forms, run controls, execution history, live progress.
9. **Hardening:** Ownership and malformed-input tests, safe logs/errors, reconnect behavior, production cookie/HTTPS settings.
10. **Docker and CI:** Containerize appropriately, add GitHub Actions checks, document manual deployment.

## Test plan
Use Vitest + Supertest and a dedicated PostgreSQL test database. Isolate test data; never run destructive tests against production.

### Authentication
- Valid registration works; duplicate email rejected.
- Password is not stored in plaintext.
- Invalid credentials and invalid/expired tokens are rejected.
- Refresh rotates token and invalidates prior token.
- Logout revokes refresh token.
- Refresh-token reuse is detected and handled.
- Sensitive endpoints are rate-limited.

### Authorization
- Protected endpoints reject unauthenticated requests.
- User A cannot read/update/delete User B's workflow.
- User A cannot start/cancel/read User B's execution.
- Unauthorized users cannot join another user's Socket.IO execution room.

### Workflow validation
- Valid workflow saves.
- Malformed fields, unsupported step types/operators, and mismatched input types are rejected.
- Maximum steps, branching depth, and definition size are enforced.
- Update/delete require ownership.
- New runs use the latest saved definition.

### Execution
- Starting a run persists an execution and returns its ID.
- Log step records the expected message.
- True and false conditions choose the correct branch.
- Successful execution reaches `completed`.
- Failed step stops later steps and reaches `failed`; safe failure details persist.
- Cancellation takes effect at a safe checkpoint and does not claim to undo side effects.
- Repeated submission with the same idempotency key does not create duplicate records.
- New keys allow intentional independent runs.
- Concurrent runs do not corrupt each other's state.
- Transaction failure does not leave partially created initial state.
- Tests document that V1 does not guarantee crash recovery.

### Monitoring and operations
- Authorized clients receive progress updates; unauthorized clients cannot subscribe.
- Reconnecting clients refetch persisted state.
- UI correctness does not depend on receiving every socket event.
- Invalid requests produce safe errors; request size and CORS restrictions work.
- Stack traces, passwords, tokens, and secrets are absent from client responses/logs.
- OpenAPI docs match implemented endpoints.

## Definition of done
1. Acceptance criteria are met.
2. Relevant backend validation and authorization exist.
3. Relevant tests pass.
4. Errors are handled consistently.
5. No secrets are logged.
6. Documentation is updated if behavior or architecture changes.
7. `git diff` is reviewed before commit.

Update phase status only after verification, not merely because code has been written.
