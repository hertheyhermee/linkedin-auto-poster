const cron = require('node-cron');
const generateContent = require('./contentGenerator');
const sendTelegramMessage = require('./notifier');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'linkedin-auto-poster';
const COLLECTION = 'pendingPosts';

async function getDb() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  return client.db(DB_NAME);
}

console.log('Starting LinkedIn Auto Poster...');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not Set');
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Not Set');
console.log('TELEGRAM_USER_ID:', process.env.TELEGRAM_USER_ID ? 'Set' : 'Not Set');
console.log('LINKEDIN_EMAIL:', process.env.LINKEDIN_EMAIL ? 'Set' : 'Not Set');
console.log('LINKEDIN_PASSWORD:', process.env.LINKEDIN_PASSWORD ? 'Set' : 'Not Set');

async function schedulePost() {
  const { content } = await generateContent();
  const db = await getDb();
  await db.collection(COLLECTION).deleteMany({}); // Only one pending post at a time
  await db.collection(COLLECTION).insertOne({ content, createdAt: new Date() });
  await sendTelegramMessage(`📝 *Review your post for today:*
\n${content}\n\nReply with /approve to publish or /skip to ignore.`);
}

// 6:00 AM
cron.schedule('0 6 * * *', schedulePost);
// 12:30 PM
cron.schedule('30 12 * * *', schedulePost);
// 7:00 PM
cron.schedule('0 19 * * *', schedulePost);
