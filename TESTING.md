# Testing

## Unit Tests

- `tests/aiService.test.ts`
  - Validates citation arrays against transcript timestamps.
  - Detects hallucinated assignees not present in participants or transcript speakers.
- `tests/reminderService.test.ts`
  - Mocks overdue action item discovery.
  - Ensures Telegram messages are sent and reminder logs are created.

## Integration Tests (Suggested)

- Register/login flow
- Meeting creation and retrieval
- AI analysis endpoint rejects ungrounded citations
- Action item create, status updates, and pagination
- Overdue scheduler job sends reminder logs

## Run tests

```bash
npm test
```
