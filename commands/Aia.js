const { keith } = require("../keizzah/keith");
const ai = require('unlimited-ai');
const axios = require('axios'); // Added missing axios import
const fs = require('fs');
const conf = require(__dirname + "/../set");
const { repondre } = require(__dirname + "/../keizzah/context");

// Common contextInfo configuration
const getContextInfo = (title = '', userJid = '', thumbnailUrl = '') => ({
  mentionedJid: [userJid],
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363249464136503@newsletter",
    newsletterName: "Beltah Tech Updates",
    serverMessageId: Math.floor(100000 + Math.random() * 900000),
  },
  externalAdReply: {
    showAdAttribution: true,
    title: title || conf.BOT,
    body: "Keep Leaning with Beltah Md",
    thumbnailUrl: thumbnailUrl || 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg',
    sourceUrl: settings.GURL || '',
    mediaType: 1,
    renderLargerThumbnail: false
  }
});
// Common function for fetching GPT responses
const fetchGptResponse = async (url, query) => {
  try {
    const response = await axios.get(url + encodeURIComponent(query));
    const data = response.data;
    if (data && data.status) {
      return data.BK9;
    } else {
      throw new Error('Failed to retrieve GPT response.');
    }
  } catch (error) {
    console.error('Error fetching GPT response:', error);
    return 'Something went wrong. Unable to fetch GPT response.';
  }
};

// General handler for AI commands
const handleAiCommand = async (dest, zk, params, url, usageExample) => {
  const { repondre, arg } = params;
  const alpha = arg.join(" ").trim();

  if (!alpha) {
    return repondre(usageExample);
  }

  const text = alpha;

  try {
    const response = await fetchGptResponse(url, text);

  await zk.sendMessage(dest, {
            text: response,
            contextInfo: getContextInfo(conf.BOT, senderName, 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg')
        }, { quoted: ms });
  } catch (error) {
    console.error("Error generating AI response:", error);
    await repondre("Sorry, I couldn't process your request.");
  }
};

// Keith command handlers
keith({
  nomCom: "beltahmd",
  aliases: ["beltamd", "beltahbot"],
  reaction: '🛸',
  categorie: "AI"
}, async (dest, zk, params) => {
  handleAiCommand(dest, zk, params, "https://bk9.fun/ai/BK93?BK9=you%20are%20zoro%20from%20one%20piece&q=", "Hello there, This is BELTAH-MD BOT, How may I help you with?");
});

keith({
  nomCom: "gpt",
  aliases: ["ilamaa", "ilamaai"],
  reaction: '👻',
  categorie: "AI"
}, async (dest, zk, params) => {
  handleAiCommand(dest, zk, params, "https://bk9.fun/ai/llama?q=", "Example usage: gpt Hi, how are you?");
});

keith({
  nomCom: "gemini",
  aliases: ["gemini4", "geminiai"],
  reaction: '👻',
  categorie: "AI"
}, async (dest, zk, params) => {
  handleAiCommand(dest, zk, params, "https://bk9.fun/ai/gemini?q=", "Example usage: gemini Hi, how are you?");
});

keith({
  nomCom: "ilama",
  aliases: ["gpt4", "ai"],
  reaction: '🤖',
  categorie: "AI"
}, async (dest, zk, params) => {
  const { repondre, arg } = params;
  const alpha = arg.join(" ").trim();

  if (!alpha) {
    return repondre("Please provide a song name.");
  }

  const text = alpha;
  try {
    const model = 'gpt-4-turbo-2024-04-09';
    const messages = [
      { role: 'user', content: text },
      { role: 'system', content: 'You are an assistant in WhatsApp. You are called Keith. You respond to user commands.' }
    ];

    const response = await ai.generate(model, messages);

    await zk.sendMessage(dest, {
            text: response,
            contextInfo: getContextInfo(conf.BOT, senderName, 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg')
        }, { quoted: ms });
  } catch (error) {
    console.error("Error generating AI response:", error);
    await repondre("Sorry, I couldn't process your request.");
  }
});
