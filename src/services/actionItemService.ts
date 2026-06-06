import prisma from '../prisma';

interface CreateActionItemPayload {
  task: string;
  assignee: string;
  meetingId: string;
  dueDate: string;
  citations: string[];
}

export async function createActionItem(payload: CreateActionItemPayload) {
  return prisma.actionItem.create({
    data: {
      task: payload.task,
      assignee: payload.assignee,
      meetingId: payload.meetingId,
      dueDate: new Date(payload.dueDate),
      citations: payload.citations,
    },
  });
}

export async function updateActionItemStatus(id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') {
  return prisma.actionItem.update({
    where: { id },
    data: {
      status,
      completedAt: status === 'COMPLETED' ? new Date() : null,
    },
  });
}

export async function listActionItems(filters: {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignee?: string;
  meetingId?: string;
  page?: number;
  limit?: number;
}) {
  const where: Record<string, unknown> = {};
  if (filters.status) where.status = filters.status;
  if (filters.assignee) where.assignee = filters.assignee;
  if (filters.meetingId) where.meetingId = filters.meetingId;

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;

  const [items, total] = await Promise.all([
    prisma.actionItem.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { meeting: true },
    }),
    prisma.actionItem.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function getOverdueActionItems() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return prisma.actionItem.findMany({
    where: {
      status: { not: 'COMPLETED' },
      dueDate: { lt: new Date() },
      reminderLogs: {
        none: {
          sentAt: { gte: twentyFourHoursAgo },
        },
      },
    },
    include: { meeting: true },
  });
}
