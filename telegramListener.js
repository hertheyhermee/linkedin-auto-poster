require('dotenv').config();
const axios = require('axios');
const { MongoClient } = require('mongodb');
const postToLinkedIn = require('./postToLinkedIn');

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const CHAT_ID = process.env.TELEGRAM_USER_ID;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'linkedin-auto-poster';
const COLLECTION = 'pendingPosts';

async function getDb() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  return client.db(DB_NAME);
}

let lastUpdateId = null;

async function checkForCommands() {
  try {
    const res = await axios.get(`${TELEGRAM_API}/getUpdates`, {
      params: { offset: lastUpdateId ? lastUpdateId + 1 : undefined }
    });

    const updates = res.data.result;
    for (const update of updates) {
      lastUpdateId = update.update_id;

      const messageText = update.message?.text?.trim().toLowerCase();
      const senderId = update.message?.chat?.id;

      if (senderId.toString() !== CHAT_ID) continue;

      const db = await getDb();
      const pending = await db.collection(COLLECTION).findOne();

      if (!pending) {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: CHAT_ID,
          text: "No post is pending for approval."
        });
        continue;
      }

      if (messageText === "/approve") {
        await postToLinkedIn({ content: pending.content, imagePath: null });
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: CHAT_ID,
          text: "✅ Post approved and published to LinkedIn!"
        });
        await db.collection(COLLECTION).deleteOne({ _id: pending._id });
      } else if (messageText === "/skip") {
        await db.collection(COLLECTION).deleteOne({ _id: pending._id });
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: CHAT_ID,
          text: "🚫 Post skipped and deleted."
        });
      }
    }
  } catch (err) {
    console.error("Listener error:", err.message);
  }
}

setInterval(checkForCommands, 15000);
