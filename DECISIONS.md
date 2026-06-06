# Architectural Decisions

## JWT Authentication
- Chosen for stateless token-based auth that supports mobile and web clients.
- Simplifies protecting `/api/meetings` and `/api/action-items` without session storage.

## PostgreSQL
- Preferred for production-grade relational storage and query flexibility.
- Used with Prisma ORM to provide type-safe database access and schema migrations.
- Docker compose is included for a reproducible database environment.

## Telegram Bot Integration
- Telegram is simple to integrate with a bot token and a fixed chat id from env.
- This meets the external integration requirement while keeping the reminder path straightforward.

## node-cron
- Used for hourly overdue checks in a lightweight scheduler.
- Allows the backend to send reminder messages without external job orchestration.

## Trade-offs
- AI analysis is built as a synchronous API call. This is simple but can block request latency.
- Telegram integration uses a fixed chat id to simplify the demo flow; a more production-ready design would support per-user chat IDs.
- Swagger docs are generated from route comments rather than a separate OpenAPI YAML file to keep the implementation self-contained.
