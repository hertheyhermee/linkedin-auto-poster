require('dotenv').config();
const axios = require('axios');

async function sendTelegramMessage(message) {
  const chatId = process.env.TELEGRAM_USER_ID;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  console.log('Attempting to send Telegram message...');
  console.log('Using chat ID:', chatId);
  console.log('Message length:', message.length);

  try {
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message
    });
    console.log("Telegram notification sent successfully:", response.data);
    return true;
  } catch (error) {
    console.error("Telegram notification failed. Error details:");
    console.error("Status:", error.response?.status);
    console.error("Status Text:", error.response?.statusText);
    console.error("Response Data:", error.response?.data);
    console.error("Full Error:", error.message);
    return false;
  }
}

module.exports = sendTelegramMessage;
