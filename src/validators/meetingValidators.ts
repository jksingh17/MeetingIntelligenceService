import { z } from 'zod';

const transcriptItem = z.object({
  timestamp: z.string().min(1),
  speaker: z.string().min(1),
  text: z.string().min(1),
});

export const createMeetingSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    meetingDate: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
      message: 'meetingDate must be an ISO date string',
    }),
    participants: z.array(z.string().email()).nonempty(),
    transcript: z.array(transcriptItem).nonempty(),
  }),
});

export const meetingFiltersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }),
});
