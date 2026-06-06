import { z } from 'zod';

export const createActionItemSchema = z.object({
  body: z.object({
    task: z.string().min(3),
    assignee: z.string().min(1),
    meetingId: z.string().min(1),
    dueDate: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
      message: 'dueDate must be an ISO date string',
    }),
    citations: z.array(z.string().min(1)).nonempty(),
  }),
});

export const updateActionStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  }),
});

export const actionItemFiltersSchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    assignee: z.string().optional(),
    meetingId: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
