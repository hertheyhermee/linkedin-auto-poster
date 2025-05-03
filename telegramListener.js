require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const postToLinkedIn = require('./postToLinkedIn');

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const CHAT_ID = process.env.TELEGRAM_USER_ID;
const tempPostFile = path.join(__dirname, 'pendingPost.txt');
const tempImageFile = path.join(__dirname, 'pendingImage.png');

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

      if (messageText === "/approve") {
        const content = fs.readFileSync(tempPostFile, 'utf8');
        let imagePath = null;
        if (fs.existsSync(tempImageFile)) imagePath = tempImageFile;
        await postToLinkedIn({ content, imagePath });
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: CHAT_ID,
          text: "✅ Post approved and published to LinkedIn!"
        });
        fs.unlinkSync(tempPostFile);
        if (imagePath) fs.unlinkSync(tempImageFile);
      } else if (messageText === "/skip") {
        fs.unlinkSync(tempPostFile);
        if (fs.existsSync(tempImageFile)) fs.unlinkSync(tempImageFile);
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
