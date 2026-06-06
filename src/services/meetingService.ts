import prisma from '../prisma';
import { analyzeMeetingTranscript, AnalysisResult } from './aiService';

interface CreateMeetingPayload {
  title: string;
  meetingDate: string;
  participants: string[];
  transcript: unknown[];
}

export async function createMeeting(userId: string, payload: CreateMeetingPayload) {
  return prisma.meeting.create({
    data: {
      title: payload.title,
      meetingDate: new Date(payload.meetingDate),
      participants: payload.participants,
      transcript: payload.transcript,
      ownerId: userId,
    },
  });
}

export async function getMeetingById(meetingId: string) {
  return prisma.meeting.findUnique({
    where: { id: meetingId },
  });
}

export async function listMeetings(page = 1, limit = 10, dateFrom?: string, dateTo?: string) {
  const where: Record<string, unknown> = {};
  if (dateFrom || dateTo) {
    where.meetingDate = {} as Record<string, unknown>;
    if (dateFrom) {
      (where.meetingDate as any).gte = new Date(dateFrom);
    }
    if (dateTo) {
      (where.meetingDate as any).lte = new Date(dateTo);
    }
  }

  const [items, total] = await Promise.all([
    prisma.meeting.findMany({
      where,
      orderBy: { meetingDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.meeting.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function analyzeMeeting(meetingId: string) {
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) {
    throw new Error('Meeting not found');
  }

  const analysis = await analyzeMeetingTranscript(meeting);

  await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      aiSummary: analysis.summary,
      aiActionItems: analysis.actionItems,
      aiDecisions: analysis.decisions,
      aiFollowUps: analysis.followUpSuggestions,
    },
  });

  return analysis;
}
