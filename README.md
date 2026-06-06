# Meeting Intelligence Service

A Node.js + Express + TypeScript backend for meeting intelligence: meeting storage, AI transcript analysis, action items, overdue reminders via Telegram, and API documentation.

## Features

- JWT auth with email/password
- Meeting CRUD with transcript JSON storage
- AI analysis endpoint with citation validation
- Manual action item management and status updates
- Overdue reminder scheduler using node-cron
- Telegram bot integration for reminders
- Swagger API docs at `/api-docs`
- Structured logging with trace IDs

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start locally:
   ```bash
   npm run dev
   ```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key for AI analysis
- `TELEGRAM_BOT_TOKEN` - Telegram bot token from BotFather
- `TELEGRAM_CHAT_ID` - Telegram chat id for reminders
- `PORT` - server port
- `NODE_ENV` - environment

## Local Run

- API server: `npm run dev`
- Production build: `npm run build && npm start`
- Swagger docs: `http://localhost:4000/api-docs`

## API Examples

### Register

POST `/api/auth/register`

Body:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "telegramId": "123456789"
}
```

### Login

POST `/api/auth/login`

Body:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Create meeting

POST `/api/meetings`

Headers:
```
Authorization: Bearer <token>
```

Body:
```json
{
  "title": "Sprint Planning",
  "meetingDate": "2026-06-05T14:00:00Z",
  "participants": ["alice@example.com", "bob@example.com"],
  "transcript": [
    {"timestamp": "00:10", "speaker": "Alice", "text": "We need to update the roadmap."}
  ]
}
```
