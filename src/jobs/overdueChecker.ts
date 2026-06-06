import cron from 'node-cron';
import { sendOverdueReminders } from '../services/reminderService';
import { logger } from '../utils/logger';

export function startOverdueChecker() {
  cron.schedule('0 * * * *', async () => {
    try {
      const count = await sendOverdueReminders();
      logger.info({ count }, 'Overdue reminder job completed');
    } catch (error) {
      logger.error({ err: error }, 'Overdue reminder job failed');
    }
  });
}
