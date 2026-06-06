import { Request, Response } from 'express';
import { successResponse } from '../utils/apiResponse';

export function healthHandler(req: Request, res: Response) {
  return successResponse(res, req.traceId ?? 'unknown', { status: 'UP' });
}

export function evaluationHandler(req: Request, res: Response) {
  return successResponse(res, req.traceId ?? 'unknown', {
    candidate: 'Meeting Intelligence Service Backend',
    repoUrl: 'https://github.com/your-org/meeting-intelligence-service',
    deployedUrl: 'https://your-deployment.example.com',
    features: [
      'JWT authentication',
      'Meeting CRUD',
      'AI transcript analysis with citation validation',
      'Action item management',
      'Overdue reminders via Telegram bot',
      'Swagger API documentation',
    ],
  });
}
