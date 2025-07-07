const { keith } = require("../keizzah/keith");
const axios = require("axios");

// Configuration object (assumed to be globally available or required if not)
const conf = global.conf || {};

// Helper function to generate context info for forwarded messages
function getContextInfo({
  title = "",
  userJid = "",
  thumbnailUrl = "",
} = {}) {
  try {
    return {
      mentionedJid: userJid ? [userJid] : [],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363249464136503@newsletter",
        newsletterName: "Beltah Tech Updates",
        serverMessageId: Math.floor(100000 + Math.random() * 900000),
      },
      externalAdReply: {
        showAdAttribution: true,
        title: conf?.BOT || "BELTAH-MD GPT4",
        body: "🟢 Powering Smart Automation 🟢",
        thumbnailUrl: thumbnailUrl || conf?.URL || "",
        sourceUrl: conf?.GURL || "https://wa.me/254114141192",
      },
    };
  } catch (error) {
    console.error(`Error in getContextInfo: ${error.message}`);
    return {};
  }
}

// Helper function for replying with context info
function repondre(zk, dest, ms, message, contextInfo = {}) {
  return zk.sendMessage(dest, { text: message, contextInfo }, { quoted: ms });
}

// Delay and last text timestamp for rate-limiting
const messageDelay = 8000; // 8 seconds
let lastTextTime = 0;

keith(
  {
    nomCom: "gpt",
    aliases: ["gpt4", "ai"],
    reaction: "📝",
    categorie: "AI",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, arg, auteurMessage } = commandeOptions;
    const query = arg.join(" ").trim();

    if (!query) {
      return repondre(
        zk,
        dest,
        ms,
        "Please provide a message.",
        getContextInfo({
          title: "BELTAH-MD GPT4",
          userJid: auteurMessage,
          thumbnailUrl: "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg",
        })
      );
    }

    // Uncomment below to restrict chatbot usage via config
    // if (conf?.CHATBOT !== 'yes') {
    //   return repondre(
    //     zk, dest, ms,
    //     "Chatbot is disabled.",
    //     getContextInfo({
    //       title: "BELTAH-MD GPT4",
    //       userJid: auteurMessage,
    //       thumbnailUrl: "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg",
    //     })
    //   );
    // }

    const currentTime = Date.now();
    if (currentTime - lastTextTime < messageDelay) {
      return repondre(
        zk,
        dest,
        ms,
        "Please wait a moment before sending another GPT request.",
        getContextInfo({
          title: "BELTAH-MD GPT4",
          userJid: auteurMessage,
          thumbnailUrl: "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg",
        })
      );
    }

    try {
      const response = await axios.get(
        "https://apis-keith.vercel.app/ai/gpt",
        {
          params: { q: query },
          timeout: 10000,
        }
      );

      if (response.data?.status && response.data?.result) {
        const italicMessage = `_${response.data.result}_`;
        await zk.sendMessage(
          dest,
          {
            text: italicMessage,
            contextInfo: getContextInfo({
              title: "BELTAH-MD GPT4",
              userJid: auteurMessage,
              thumbnailUrl:
                "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg",
            }),
          },
          { quoted: ms }
        );
        lastTextTime = currentTime;
      } else {
        repondre(
          zk,
          dest,
          ms,
          "Failed to get a valid response from the AI.",
          getContextInfo({
            title: "BELTAH-MD GPT4",
            userJid: auteurMessage,
            thumbnailUrl:
              "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg",
          })
        );
      }
    } catch (error) {
      console.error("Error fetching GPT response:", error.message || error);
      repondre(
        zk,
        dest,
        ms,
        "Sorry, an error occurred while processing your request. Please try again later.",
        getContextInfo({
          title: "BELTAH-MD GPT4",
          userJid: auteurMessage,
          thumbnailUrl:
            "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg",
        })
      );
    }
  }
);
