import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requestLogger } from '../utils/logger';

export function traceIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const traceId = uuidv4();
  req.traceId = traceId;
  res.setHeader('x-trace-id', traceId);
  req.logger = requestLogger(traceId);
  next();
}
