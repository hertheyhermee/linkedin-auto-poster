require('dotenv').config();
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_TEXT_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent';

async function generateContent() {
  try {
    // Generate a detailed, engaging, educational, and viral LinkedIn post
    const textPrompt = {
      contents: [
        { role: 'user', parts: [
          { text: `Write a highly detailed, intriguing, and educational LinkedIn post for a software developer. The post should:
- Teach a valuable lesson or concept in software engineering or tech
- Use storytelling, real-world examples, or analogies
- Be engaging and likely to draw comments and shares
- Be original and not generic
- Add emojis to make it more engaging and fun
- Avoid formatting texts like bold, italic, etc. because it will not be visible on LinkedIn
- You can use format types that will be visible on LinkedIn
- End with a thought-provoking question or call to action for the audience

Format: POST: <your post>` }
        ]}
      ]
    };
    const textRes = await axios.post(
      `${GEMINI_TEXT_URL}?key=${GEMINI_API_KEY}`,
      textPrompt
    );
    const text = textRes.data.candidates[0].content.parts[0].text.trim();
    const postMatch = text.match(/POST:(.*)$/s);
    const content = postMatch ? postMatch[1].trim() : text;
    return { content, imagePath: null };
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    return { content: 'Just another day in the life of a developer 🚀 #CodeLife', imagePath: null };
  }
}

module.exports = generateContent;
