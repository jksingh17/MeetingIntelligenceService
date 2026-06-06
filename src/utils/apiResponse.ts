import { Response } from 'express';

export function successResponse(res: Response, traceId: string, data: unknown, status = 200) {
  return res.status(status).json({ success: true, traceId, data });
}

export function errorResponse(res: Response, traceId: string, code: string, message: string, status = 500) {
  return res.status(status).json({ success: false, traceId, error: { code, message } });
}
