import { sendTelegramReminder } from './external/telegramService';
import { getOverdueActionItems } from './actionItemService';
import prisma from '../prisma';

function formatReminder(actionItem: any): string {
  return `Reminder: ${escapeMarkdown(actionItem.task)}\nAssigned To: ${escapeMarkdown(actionItem.assignee)}\nDue Date: ${actionItem.dueDate.toISOString()}\nMeeting: ${escapeMarkdown(actionItem.meeting.title)}`;
}

function escapeMarkdown(text: string): string {
  return text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\!\|\\]/g, '\\$&');
}

export async function sendOverdueReminders(): Promise<number> {
  const overdueItems = await getOverdueActionItems();
  for (const item of overdueItems) {
    const message = formatReminder(item);
    const externalResponse = await sendTelegramReminder(message);

    // Create reminder log with required fields (store external response)
    await prisma.reminderLog.create({
      data: {
        actionItemId: item.id,
        externalResponse: externalResponse,
      } as any,
    });
  }

  return overdueItems.length;
}