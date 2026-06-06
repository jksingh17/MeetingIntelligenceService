import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { errorResponse } from '../utils/apiResponse';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  const traceId = req.traceId ?? 'unknown';

  if (err instanceof ZodError) {
    return errorResponse(res, traceId, 'VALIDATION_ERROR', err.errors.map((issue) => issue.message).join('; '), 400);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return errorResponse(res, traceId, 'PRISMA_DUPLICATE', 'Duplicate record already exists', 400);
    }
    return errorResponse(res, traceId, 'PRISMA_ERROR', err.message, 400);
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return errorResponse(res, traceId, 'PRISMA_VALIDATION', err.message, 400);
  }

  if (err instanceof Error) {
    return errorResponse(res, traceId, 'SERVER_ERROR', err.message || 'Internal server error', 500);
  }

  return errorResponse(res, traceId, 'SERVER_ERROR', 'Unknown server error', 500);
}
