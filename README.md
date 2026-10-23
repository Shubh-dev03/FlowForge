# FlowForge

**A workflow automation platform for building, executing, and monitoring automated workflows.**

FlowForge enables users to define workflows composed of triggers, conditions, and actions, then track their execution through a centralized interface with real-time status updates.

## Core Features

- **Workflow Management** — Create, configure, and manage workflows.
- **Conditional Logic** — Execute actions based on defined conditions.
- **Workflow Execution** — Process workflow runs and track their outcomes.
- **Execution History** — Persist execution status and step-level results.
- **Real-Time Monitoring** — Observe workflow execution progress through WebSockets.
- **Reliable Background Processing** — Planned asynchronous execution, retries, and job management.

## Technology Stack

- **Frontend:** React, TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **Real-Time Communication:** WebSockets
- **Background Jobs:** Redis, BullMQ
- **Deployment:** Docker
- **CI/CD:** Planned

_The stack and features will be implemented incrementally as the project develops._

## Project Structure

FlowForge/
├── frontend/ # React application
├── backend/ # API and workflow execution services
├── Docs/ # Requirements, roadmap, and architecture decisions
├── .gitignore
└── README.md

## Development Status

**Status:** Initial setup

The project is currently in its planning and environment-setup phase. Features will be developed and tested incrementally before deployment.

## Project Documentation

- [Roadmap, Requirements & Test Cases](Docs/README_ROADMAP_REQUIREMENTS_TESTS.md)
- [AI-Assisted Development Rules](Docs/README_AI_DEVELOPMENT_RULES.md)
- [Architecture Decisions](Docs/README_ARCHITECTURE_DECISIONS.md)

## Engineering Goals

- Maintain clear separation of frontend and backend responsibilities.
- Validate inputs and handle errors consistently.
- Persist authoritative workflow and execution state in PostgreSQL.
- Use real-time events to communicate execution progress.
- Introduce background processing, retries, automated testing, and deployment practices incrementally.
