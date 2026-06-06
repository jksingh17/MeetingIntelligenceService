import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import config from '../config';
import { successResponse, errorResponse } from '../utils/apiResponse';

const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
  const { email, password, telegramId } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        telegramId,
      },
    });

    return successResponse(res, req.traceId ?? 'unknown', { userId: user.id }, 201);
  } catch (error) {
    return errorResponse(res, req.traceId ?? 'unknown', 'REGISTER_FAILED', 'Unable to register user', 400);
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return errorResponse(res, req.traceId ?? 'unknown', 'AUTH_INVALID', 'Invalid credentials', 401);
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return errorResponse(res, req.traceId ?? 'unknown', 'AUTH_INVALID', 'Invalid credentials', 401);
  }

  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '8h' });
  return successResponse(res, req.traceId ?? 'unknown', { token });
}
