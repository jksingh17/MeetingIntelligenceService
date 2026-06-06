import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { createActionItem, updateActionItemStatus, listActionItems } from '../services/actionItemService';

// Helper to extract string from query param
function paramString(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value ?? '';
}

export async function createActionItemHandler(req: Request, res: Response) {
  try {
    // Extract userId from authenticated request (assumes auth middleware sets req.user)
    const userId = (req as any).user?.userId;
    if (!userId) {
      return errorResponse(res, req.traceId ?? 'unknown', 'UNAUTHORIZED', 'User not authenticated', 401);
    }

    const actionItem = await createActionItem(userId, req.body);
    return successResponse(res, req.traceId ?? 'unknown', actionItem, 201);
  } catch (error: any) {
    return errorResponse(res, req.traceId ?? 'unknown', 'ACTION_CREATE_FAILED', error.message, 400);
  }
}

export async function updateActionItemStatusHandler(req: Request, res: Response) {
  try {
    const actionItem = await updateActionItemStatus(paramString(req.params.id), req.body.status);
    return successResponse(res, req.traceId ?? 'unknown', actionItem);
  } catch (error: any) {
    return errorResponse(res, req.traceId ?? 'unknown', 'ACTION_UPDATE_FAILED', error.message, 400);
  }
}

export async function listActionItemsHandler(req: Request, res: Response) {
  try {
    const page = Number(req.query.page ?? '1');
    const limit = Number(req.query.limit ?? '10');
    const list = await listActionItems({
      status: req.query.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | undefined,
      assignee: req.query.assignee as string | undefined,
      meetingId: req.query.meetingId as string | undefined,
      page,
      limit,
    });
    return successResponse(res, req.traceId ?? 'unknown', list);
  } catch (error: any) {
    return errorResponse(res, req.traceId ?? 'unknown', 'ACTION_LIST_FAILED', error.message, 400);
  }
}