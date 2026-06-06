import app from './app';
import config from './config';
import { startOverdueChecker } from './jobs/overdueChecker';
import { logger } from './utils/logger';

const port = config.port;

app.listen(port, () => {
  logger.info({ port }, 'Meeting Intelligence Service is running');
  startOverdueChecker();
});
