const { keith } = require("../keizzah/keith");
const axios = require('axios');

//Context to read forwarded info 
function getContextInfo(title = '', userJid = '', thumbnailUrl = '') {
  try {
    return {
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
        title: conf.BOT || 'BELTAH-MD',
        body: "🟢 Powering Smart Automation 🟢",
        thumbnailUrl: conf.URL || '',
        sourceUrl: conf.GURL || 'https://wa.me/254114141192',
      },
    };
  } catch (error) {
    console.error(`Error in getContextInfo: ${error.message}`);
    return {};
  }
}
// Delay and last text timestamp for rate-limiting (can be adjusted)
const messageDelay = 8000; // 8 seconds
let lastTextTime = 0;

keith({
  nomCom: "gpt",
  aliases: ["gpt4", "ai"],
  reaction: '👻',
  categorie: "AI"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg, superUser, auteurMessage, origineMessage } = commandeOptions;
  const query = arg.join(" ").trim(); // Get the user's query

  if (!query) {
    return repondre(zk, dest, ms, "Please provide a message.");
  }

  // Optional: If you want to restrict chatbot to config, uncomment below
  // if (conf.CHATBOT !== 'yes') {
  //   return repondre(zk, dest, ms, "Chatbot is disabled.");
  // }

  // If used as a chatbot (auto-reply), this logic can be ported elsewhere as needed
  // Here, we apply similar delay control for command use
  const currentTime = Date.now();
  if (currentTime - lastTextTime < messageDelay) {
    return repondre(zk, dest, ms, "Please wait a moment before sending another GPT request.");
  }

  try {
    // Use the same API as in chatbot logic
    const response = await axios.get('https://apis-keith.vercel.app/ai/gpt', {
      params: { q: query },
      timeout: 10000,
    });

    if (response.data?.status && response.data?.result) {
      // Format message in italic (WhatsApp markdown) and mention sender
      const italicMessage = `_${response.data.result}_`;
      await zk.sendMessage(dest, {
        text: italicMessage,
        contextInfo: getContextInfo("BELTAH-MD GPT RESPONSE", auteurMessage);
      }, { quoted: ms });

      lastTextTime = currentTime;
    } else {
      repondre(zk, dest, ms, "Failed to get a valid response from the AI.");
    }
  } catch (error) {
    console.error("Error fetching GPT response:", error.message || error);
    repondre(zk, dest, ms, "Sorry, an error occurred while processing your request. Please try again later.");
  }
});
