# AI Approach

## Prompt Engineering
- The AI prompt is explicit: only use transcript data.
- The assistant is instructed not to invent attendees, tasks, decisions, or outcomes.
- Output is requested in an exact JSON shape to simplify parsing and validation.

## Citation Validation
- Every response item must include at least one timestamp citation.
- Timestamps are validated against the transcript entries present in the meeting record.
- The timestamp validation prevents the AI from adding unsupported references.

## Hallucination Prevention
- Action item assignees are validated against participant emails and transcript speaker names.
- If an assignee is not grounded in the meeting data, analysis is rejected.
- The service treats invalid citations or unsupported assignees as hallucinations.

## Fallback Logic
- The service parses the raw AI output and extracts only the JSON payload.
- If parsing or validation fails, the API responds with a clear error rather than storing invalid data.
- This ensures only grounded analysis is saved to the meeting record.
