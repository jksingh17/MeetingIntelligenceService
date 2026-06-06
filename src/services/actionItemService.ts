import prisma from '../prisma';

interface CreateActionItemPayload {
  task: string;
  assignee: string;
  meetingId: string;
  dueDate: string;
  citations: string[];
}

export async function createActionItem(userId: string, payload: CreateActionItemPayload) {
  return prisma.actionItem.create({
    data: {
      task: payload.task,
      assignee: payload.assignee,
      meetingId: payload.meetingId,
      dueDate: new Date(payload.dueDate),
      citations: JSON.stringify(payload.citations),
      createdBy: userId,  // ✅ required field from your schema
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

  // Parse citations back to array for each action item
  const parsedItems = items.map((item: any) => ({
    ...item,
    citations: item.citations ? JSON.parse(item.citations) : [],
  }));

  return { items: parsedItems, total, page, limit };
}

export async function getOverdueActionItems() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const items = await prisma.actionItem.findMany({
    where: {
      status: { not: 'COMPLETED' },
      dueDate: { lt: new Date() },
      reminders: {
        none: {
          sentAt: { gte: twentyFourHoursAgo },
        },
      },
    },
    include: { meeting: true },
  });

  // Parse citations for each overdue item
  return items.map((item: any) => ({
    ...item,
    citations: item.citations ? JSON.parse(item.citations) : [],
  }));
}