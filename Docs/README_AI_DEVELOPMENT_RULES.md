# FlowForge AI-Assisted Development Rules

## 1. Small, explicit steps
Before each step, state what file/behavior changes, why, expected impact, and how it will be verified. Work on one meaningful task at a time; do not jump ahead or make unrelated changes.

## 2. Teach rather than replace the developer
- Do not provide full files or full implementation code unless explicitly requested.
- Prefer small snippets and targeted edits.
- Let the developer attempt implementation where practical.
- Review code correctness first, explain mistakes, then discuss improvements.
- Do not optimize before basic logic is correct.
- Explain unfamiliar tools in project-specific terms.

## 3. Never invent project state
- Do not claim a file, dependency, command, test, commit, deployment, or feature exists unless confirmed.
- Ask for current file contents or command output when needed.
- Do not assume suggested commands succeeded.
- Never invent environment values, routes, columns, or repository state.
- Label assumptions and verify them before relying on them.

## 4. Respect agreed scope
- `README.md` defines V1 scope.
- `V2-readme.md` tracks deferred candidates.
- Check `README_ARCHITECTURE_DECISIONS.md` before architecture changes.
- Do not silently add features or alter decisions.
- Do not bring Redis/BullMQ, visual editing, team collaboration, or other deferred capabilities into V1 without explicit approval.

## 5. Engineering standards
- Use TypeScript in frontend and backend.
- Validate untrusted input on the backend with Zod; frontend validation is not a security boundary.
- Enforce authentication and ownership authorization.
- Use parameterized database operations through the chosen data layer.
- Manage schema changes with Drizzle migrations.
- Keep PostgreSQL transactions short; never hold one open throughout execution or WebSocket communication.
- Use centralized error handling and safe responses.
- Use structured Pino logs; never log passwords, tokens, or secrets.
- Add/update tests for behavior changes.
- Avoid unnecessary dependencies and abstractions.

## 6. Security review
For relevant changes ask: Is the user authenticated and authorized for this exact resource? Is input validated? Could data belonging to another user leak? Could errors/logs expose secrets? Are rate, size, and resource limits needed? Are cookie/CORS/CSRF/HTTPS settings correct? Could repeated requests or retries duplicate side effects?

Never claim the app cannot be hacked or that execution is exactly-once without a justified mechanism.

## 7. Testing
- Run the smallest relevant test, then broader checks.
- Use the dedicated PostgreSQL test database.
- Never run destructive tests against production.
- Test success and failure paths, including authorization and malformed inputs.
- Report exactly which checks ran and their outcomes; identify checks not run.
- Diagnose failures before unrelated changes.

## 8. Git
- Check `git status` before staging.
- Review `git diff` and `git diff --cached` before committing.
- Make small commits with clear messages.
- Never commit `.env`, credentials, tokens, dumps, or secrets.
- Keep `.env.example` to placeholders.
- Do not claim a change is on GitHub unless it was pushed and verified.

## 9. Documentation
- Update architecture docs when an agreed decision changes.
- Update requirements/tests when acceptance criteria change.
- Put deferred features in `V2-readme.md` with purpose, reason deferred, prerequisites, order, and expected value.
- Treat V2 items as candidates, not guaranteed commitments.

## 10. Communication style
Be concise and precise. State what is being worked on and the impact. Ask one direct question at a time only when a real decision is needed. Do not dump future steps before the current step is complete.
