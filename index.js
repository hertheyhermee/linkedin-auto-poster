const cron = require('node-cron');
const generateContent = require('./contentGenerator');
const sendTelegramMessage = require('./notifier');
const fs = require('fs');
const path = require('path');

const tempPostFile = path.join(__dirname, 'pendingPost.txt');
const tempImageFile = path.join(__dirname, 'pendingImage.png');

console.log('Starting LinkedIn Auto Poster...');
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Not Set');
console.log('TELEGRAM_USER_ID:', process.env.TELEGRAM_USER_ID ? 'Set' : 'Not Set');
console.log('LINKEDIN_EMAIL:', process.env.LINKEDIN_EMAIL ? 'Set' : 'Not Set');
console.log('LINKEDIN_PASSWORD:', process.env.LINKEDIN_PASSWORD ? 'Set' : 'Not Set');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'Not Set');

async function schedulePost() {
  const { content, imagePath } = await generateContent();
  fs.writeFileSync(tempPostFile, content);
  if (imagePath) fs.writeFileSync(tempImageFile, fs.readFileSync(imagePath));
  await sendTelegramMessage(`📝 *Review your post for today:*

${content}

Reply with /approve to publish or /skip to ignore.`);
}

// 6:00 AM
cron.schedule('0 6 * * *', schedulePost);
// 12:30 PM
cron.schedule('30 12 * * *', schedulePost);
// 7:00 PM
cron.schedule('0 19 * * *', schedulePost);
