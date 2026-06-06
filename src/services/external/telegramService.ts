import axios from 'axios';
import config from '../../config';

export async function sendTelegramReminder(message: string) {
  const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
  const payload = {
    chat_id: config.telegramChatId,
    text: message,
    parse_mode: 'MarkdownV2',
  };
  const response = await axios.post(url, payload, { timeout: 10000 });
  return response.data;
}
