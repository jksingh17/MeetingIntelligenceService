import { Request, Response } from 'express';
import { successResponse } from '../utils/apiResponse';

export function healthHandler(req: Request, res: Response) {
  return successResponse(res, req.traceId ?? 'unknown', { status: 'UP' });
}

export function evaluationHandler(req: Request, res: Response) {
  return successResponse(res, req.traceId ?? 'unknown', {
    candidate: 'Meeting Intelligence Service',
    repoUrl: 'https://github.com/jksingh17/MeetingIntelligenceService',
    deployedUrl: 'https://meetingintelligenceservice.onrender.com/',
    features: [
      'JWT auth with email/password',
      'Meeting CRUD with transcript storage',
      'AI analysis endpoint with citation validation',
      'Manual action item management and status updates',
      'Overdue reminder scheduler using node-cron',
      'Telegram bot reminder integration',
      'Swagger API docs at /api-docs',
      'PostgreSQL database with Prisma ORM',
      'Structured logging with trace IDs',
    ],
  });
}
