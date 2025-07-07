const { keith } = require("../keizzah/keith");
const axios = require('axios');
//const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");

// Optional: Import your config if needed
// const conf = require("../config"); // Uncomment if you use conf.CHATBOT

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
        mentions: [auteurMessage], // Mention the sender
        contextInfo: {
          externalAdReply: {
            title: "BELTAH MD GPT4",
            body: "KEEP LEARNING WITH BELTAH-MD",
            thumbnailUrl: "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg",
            sourceUrl: "https://whatsapp.com/channel/0029VaRHDBKKmCPKp9B2uH2F",
            mediaType: 1,
            showAdAttribution: true,
          },
        },
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
