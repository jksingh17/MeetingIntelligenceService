import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = [
  'DATABASE_URL',
  'JWT_SECRET',
  'OPENAI_API_KEY',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID'
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export default {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: process.env.JWT_SECRET as string,
  openAiApiKey: process.env.OPENAI_API_KEY as string,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN as string,
  telegramChatId: process.env.TELEGRAM_CHAT_ID as string,
  databaseUrl: process.env.DATABASE_URL as string,
};
