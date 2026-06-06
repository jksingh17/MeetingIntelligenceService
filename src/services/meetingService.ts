import prisma from '../prisma';
import { analyzeMeetingTranscript, AnalysisResult } from './aiService';

interface CreateMeetingPayload {
  title: string;
  meetingDate: string;
  participants: string[];
  transcript: Array<{ timestamp: string; speaker: string; text: string }>;
}

export async function createMeeting(userId: string, payload: CreateMeetingPayload) {
  return prisma.meeting.create({
    data: {
      title: payload.title,
      meetingDate: new Date(payload.meetingDate),
      participants: JSON.stringify(payload.participants),
      transcript: JSON.stringify(payload.transcript),
      createdBy: userId,   // ✅ correct foreign key name
    },
  });
}

export async function getMeetingById(meetingId: string) {
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) return null;
  return {
    ...meeting,
    participants: meeting.participants ? JSON.parse(meeting.participants) : [],
    transcript: meeting.transcript ? JSON.parse(meeting.transcript) : [],
    aiSummary: meeting.aiSummary ? JSON.parse(meeting.aiSummary) : null,
    aiActionItems: meeting.aiActionItems ? JSON.parse(meeting.aiActionItems) : null,
    aiDecisions: meeting.aiDecisions ? JSON.parse(meeting.aiDecisions) : null,
    aiFollowUps: meeting.aiFollowUps ? JSON.parse(meeting.aiFollowUps) : null,
  };
}

export async function listMeetings(page = 1, limit = 10, dateFrom?: string, dateTo?: string) {
  const where: any = {};
  if (dateFrom || dateTo) {
    where.meetingDate = {};
    if (dateFrom) where.meetingDate.gte = new Date(dateFrom);
    if (dateTo) where.meetingDate.lte = new Date(dateTo);
  }
  const [items, total] = await Promise.all([
    prisma.meeting.findMany({ where, orderBy: { meetingDate: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.meeting.count({ where }),
  ]);
  const parsedItems = items.map((meeting: any) => ({
    ...meeting,
    participants: meeting.participants ? JSON.parse(meeting.participants) : [],
    transcript: meeting.transcript ? JSON.parse(meeting.transcript) : [],
    aiSummary: meeting.aiSummary ? JSON.parse(meeting.aiSummary) : null,
    aiActionItems: meeting.aiActionItems ? JSON.parse(meeting.aiActionItems) : null,
    aiDecisions: meeting.aiDecisions ? JSON.parse(meeting.aiDecisions) : null,
    aiFollowUps: meeting.aiFollowUps ? JSON.parse(meeting.aiFollowUps) : null,
  }));
  return { items: parsedItems, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function analyzeMeeting(meetingId: string) {
  const meeting = await getMeetingById(meetingId);
  if (!meeting) throw new Error('Meeting not found');
  const analysis = await analyzeMeetingTranscript(meeting);
  await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      aiSummary: JSON.stringify(analysis.summary),
      aiActionItems: JSON.stringify(analysis.actionItems),
      aiDecisions: JSON.stringify(analysis.decisions),
      aiFollowUps: JSON.stringify(analysis.followUpSuggestions),
    },
  });
  return analysis;
}