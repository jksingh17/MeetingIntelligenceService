import { sendOverdueReminders } from '../src/services/reminderService';
import * as actionItemService from '../src/services/actionItemService';
import * as telegramService from '../src/services/external/telegramService';
import prisma from '../src/prisma';

jest.mock('../src/services/actionItemService');
jest.mock('../src/services/external/telegramService');
jest.mock('../src/prisma', () => ({
  reminderLog: { create: jest.fn() },
}));

test('sendOverdueReminders sends telegram reminders and logs them', async () => {
  const mockItem = {
    id: 'item-1',
    task: 'Finish report',
    assignee: 'Alice',
    dueDate: new Date('2024-01-01T10:00:00Z'),
    meeting: { title: 'Weekly sync' },
  };
  (actionItemService.getOverdueActionItems as jest.Mock).mockResolvedValue([mockItem]);
  (telegramService.sendTelegramReminder as jest.Mock).mockResolvedValue({ ok: true });
  (prisma.reminderLog.create as jest.Mock).mockResolvedValue({ id: 'log-1' });

  const result = await sendOverdueReminders();

  expect(result).toBe(1);
  expect(telegramService.sendTelegramReminder).toHaveBeenCalled();
  expect(prisma.reminderLog.create).toHaveBeenCalledWith({
    data: {
      actionItemId: mockItem.id,
      externalResponse: { ok: true },
    },
  });
});
