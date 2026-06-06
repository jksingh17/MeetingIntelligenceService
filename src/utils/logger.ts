import pino from 'pino';

const baseLogger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const logger = baseLogger;

export const requestLogger = (traceId: string) =>
  baseLogger.child({ traceId });
