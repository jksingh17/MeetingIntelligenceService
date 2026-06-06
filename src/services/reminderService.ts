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

    // Create reminder log with required fields
    await prisma.reminderLog.create({
      data: {
        actionItemId: item.id,
        channel: 'TELEGRAM',           // 👈 adjust to your schema's channel enum/string
        status: 'SENT',                // 👈 or 'SUCCESS' based on your schema
        externalResponse: externalResponse, // store API response
        // If your model requires a relation to actionItem, actionItemId is sufficient
      },
    });
  }

  return overdueItems.length;
}