require('dotenv').config();
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_TEXT_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent';

const PROMPTS = [
  `Write a highly detailed, intriguing, and educational LinkedIn post for a software developer. The post should teach a valuable lesson or concept in software engineering, use storytelling or real-world examples, and end with a thought-provoking question. Do NOT use markdown formatting (like **bold** or _italic_); use only formatting that is visible on LinkedIn, such as line breaks, lists, and emojis.`,
  `Craft a LinkedIn post that shares a surprising insight or myth-busting fact about software development. Make it engaging and encourage readers to share their own experiences or opinions. Do NOT use markdown formatting (like **bold** or _italic_); use only formatting that is visible on LinkedIn, such as line breaks, lists, and emojis.`,
  `Write a motivational LinkedIn post for developers about overcoming failure or setbacks in tech. Use a real or hypothetical story and end with a call to action for the audience to share their own lessons learned. Do NOT use markdown formatting (like **bold** or _italic_); use only formatting that is visible on LinkedIn, such as line breaks, lists, and emojis.`,
  `Create a LinkedIn post that explains a complex programming concept (e.g., concurrency, functional programming, or design patterns) in simple, relatable terms. Use analogies or metaphors and invite discussion. Do NOT use markdown formatting (like **bold** or _italic_); use only formatting that is visible on LinkedIn, such as line breaks, lists, and emojis.`,
  `Share a LinkedIn post about the importance of soft skills (communication, teamwork, empathy) in software engineering. Include a personal anecdote or example and ask the audience for their thoughts. Do NOT use markdown formatting (like **bold** or _italic_); use only formatting that is visible on LinkedIn, such as line breaks, lists, and emojis.`,
  `Write a post that highlights a recent trend or technology in the software industry (e.g., AI, cloud computing, DevOps). Explain its impact and ask the audience how they are adapting to it. Do NOT use markdown formatting (like **bold** or _italic_); use only formatting that is visible on LinkedIn, such as line breaks, lists, and emojis.`,
  `Compose a LinkedIn post that gives practical career advice for junior developers. Include actionable tips and encourage readers to add their own advice in the comments. Do NOT use markdown formatting (like **bold** or _italic_); use only formatting that is visible on LinkedIn, such as line breaks, lists, and emojis.`,
  `Draft a post about the value of mentorship in tech. Share a story about a mentor or mentee experience and ask the audience to reflect on their own mentorship journeys. Do NOT use markdown formatting (like **bold** or _italic_); use only formatting that is visible on LinkedIn, such as line breaks, lists, and emojis.`,
  `Write a post that explores the ethical responsibilities of software engineers. Use a real-world scenario and ask the audience how they would handle it. Do NOT use markdown formatting (like **bold** or _italic_); use only formatting that is visible on LinkedIn, such as line breaks, lists, and emojis.`,
  `Create a post that celebrates diversity and inclusion in tech. Share why it matters and invite others to share their perspectives or initiatives. Do NOT use markdown formatting (like **bold** or _italic_); use only formatting that is visible on LinkedIn, such as line breaks, lists, and emojis.`
];

function getRandomPrompt() {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

async function generateContent() {
  try {
    const prompt = getRandomPrompt();
    const textPrompt = {
      contents: [
        { role: 'user', parts: [ { text: prompt } ] }
      ]
    };
    const textRes = await axios.post(
      `${GEMINI_TEXT_URL}?key=${GEMINI_API_KEY}`,
      textPrompt
    );
    const text = textRes.data.candidates[0].content.parts[0].text.trim();
    return { content: text, imagePath: null };
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    return { content: 'Just another day in the life of a developer 🚀 #CodeLife', imagePath: null };
  }
}

module.exports = generateContent;
