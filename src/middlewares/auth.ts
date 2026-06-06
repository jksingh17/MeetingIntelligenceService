import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { errorResponse } from '../utils/apiResponse';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return errorResponse(res, req.traceId ?? 'unknown', 'AUTH_MISSING', 'Authorization header is required', 401);
  }

  const token = authorization.replace('Bearer ', '').trim();

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (error) {
    return errorResponse(res, req.traceId ?? 'unknown', 'AUTH_INVALID', 'Invalid or expired token', 401);
  }
}
