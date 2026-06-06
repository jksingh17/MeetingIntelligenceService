import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { createMeeting, getMeetingById, listMeetings, analyzeMeeting } from '../services/meetingService';

export async function createMeetingHandler(req: Request, res: Response) {
  try {
    const meeting = await createMeeting(req.userId ?? '', req.body);
    return successResponse(res, req.traceId ?? 'unknown', meeting, 201);
  } catch (error) {
    return errorResponse(res, req.traceId ?? 'unknown', 'MEETING_CREATE_FAILED', (error as Error).message, 400);
  }
}

export async function getMeetingHandler(req: Request, res: Response) {
  const id = req.params.id as string;
  const meeting = await getMeetingById(id);
  if (!meeting) {
    return errorResponse(res, req.traceId ?? 'unknown', 'MEETING_NOT_FOUND', 'Meeting not found', 404);
  }
  return successResponse(res, req.traceId ?? 'unknown', meeting);
}

export async function listMeetingsHandler(req: Request, res: Response) {
  const page = Number(req.query.page ?? '1');
  const limit = Number(req.query.limit ?? '10');
  const result = await listMeetings(
    page,
    limit,
    req.query.dateFrom as string | undefined,
    req.query.dateTo as string | undefined
  );
  return successResponse(res, req.traceId ?? 'unknown', result);
}

export async function analyzeMeetingHandler(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const analysis = await analyzeMeeting(id);
    return successResponse(res, req.traceId ?? 'unknown', analysis);
  } catch (error) {
    return errorResponse(res, req.traceId ?? 'unknown', 'ANALYSIS_FAILED', (error as Error).message, 400);
  }
}