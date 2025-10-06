const { keith } = require('../keizzah/keith');
const gis = require('g-i-s');
const axios = require('axios');
const conf = require(__dirname + '/../set');
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");

// Utility to build common contextInfo for messages
function buildContextInfo(title, body, thumbnailUrl, sourceUrl) {
  return {
    externalAdReply: {
      title,
      body,
      thumbnailUrl,
      sourceUrl,
      mediaType: 1,
      showAdAttribution: true,
    },
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363276287415739@newsletter",
      newsletterName: "BELTAH-MD BOT",
      serverMessageId: Math.floor(100000 + Math.random() * 900000),
    },
  };
}

// Image Search Command
keith(
  {
    nomCom: "img",
    aliases: ["image", "images"],
    categorie: "Images",
    reaction: "📷",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, ms, arg } = commandeOptions;

    if (!arg[0]) {
      repondre('Which image?');
      return;
    }

    const searchTerm = arg.join(" ");
    gis(searchTerm, (error, results) => sendImage(error, results));

    function sendImage(error, results) {
      if (error) {
        repondre("Oops, an error occurred.");
        return;
      }

      if (!results || results.length === 0) {
        repondre("No images found.");
        return;
      }

      for (let i = 0; i < Math.min(results.length, 5); i++) {
        zk.sendMessage(
          dest,
          {
            image: { url: results[i].url },
            caption: `*Downloaded by ${conf.BOT}*`,
            contextInfo: buildContextInfo(
              "Image Search Result",
              `Here's the image you searched for: ${searchTerm}`,
              results[i].url,
              conf.GURL
            ),
          },
          { quoted: ms }
        );
      }
    }
  }
);

// Messi Images Command
keith(
  {
    nomCom: 'messi',
    categorie: 'images',
    reaction: '😋',
  },
  async (dest, zk, context) => {
    const { repondre: sendMessage, ms } = context;
    try {
      const response = await axios.get("https://raw.githubusercontent.com/Guru322/api/Guru/BOT-JSON/Messi.json");
      const images = response.data;

      if (!Array.isArray(images) || images.length === 0) {
        throw new Error("No images found in the response.");
      }

      for (let i = 0; i < 5; i++) {
        const randomImage = Math.floor(Math.random() * images.length);
        const image = images[randomImage];
        await zk.sendMessage(
          dest,
          {
            image: { url: image },
            caption: `*Downloaded by ${conf.BOT}*`,
            contextInfo: buildContextInfo(
              "Modern-Logo Search Result",
              `Here's an inspiring logo related to: messi`,
              image,
              conf.GURL
            ),
          },
          { quoted: ms }
        );
      }
    } catch (error) {
      console.error("Error occurred while retrieving data:", error);
      sendMessage("Error occurred while retrieving data: " + error.message);
    }
  }
);

// Waifu Command
keith(
  {
    nomCom: "waifu",
    categorie: "images",
    reaction: "🙄",
  },
  async (origineMessage, zk, commandeOptions) => {
    const { repondre, ms } = commandeOptions;
    const url = 'https://api.waifu.pics/nsfw/waifu';

    try {
      for (let i = 0; i < 5; i++) {
        const response = await axios.get(url);
        const imageUrl = response.data.url;

        await zk.sendMessage(
          origineMessage,
          {
            image: { url: imageUrl },
            caption: `*Downloaded by ${conf.BOT}*`,
            contextInfo: buildContextInfo(
              "Image Search Result",
              `Here's a great image related to: waifu`,
              imageUrl,
              conf.GURL
            ),
          },
          { quoted: ms }
        );
      }
    } catch (error) {
      repondre('Error retrieving data: ' + error.message);
    }
  }
);

// Trap Command
keith(
  {
    nomCom: "trap",
    categorie: "images",
    reaction: "🙄",
  },
  async (origineMessage, zk, commandeOptions) => {
    const { repondre, ms } = commandeOptions;
    const url = 'https://api.waifu.pics/nsfw/trap';

    try {
      for (let i = 0; i < 5; i++) {
        const response = await axios.get(url);
        const imageUrl = response.data.url;

        await zk.sendMessage(
          origineMessage,
          {
            image: { url: imageUrl },
            caption: `*Downloaded by ${conf.BOT}*`,
            contextInfo: buildContextInfo(
              "Image Search Result",
              `Here's a great image related to: waifu`,
              imageUrl,
              conf.GURL
            ),
          },
          { quoted: ms }
        );
      }
    } catch (error) {
      repondre('Error retrieving data: ' + error.message);
    }
  }
);

// HNeko Command
keith(
  {
    nomCom: "hneko",
    categorie: "images",
    reaction: "🙄",
  },
  async (origineMessage, zk, commandeOptions) => {
    const { repondre, ms } = commandeOptions;
    const url = 'https://api.waifu.pics/nsfw/neko';

    try {
      for (let i = 0; i < 5; i++) {
        const response = await axios.get(url);
        const imageUrl = response.data.url;

        await zk.sendMessage(
          origineMessage,
          {
            image: { url: imageUrl },
            caption: `*Downloaded by ${conf.BOT}*`,
            contextInfo: buildContextInfo(
              "Image Search Result",
              `Here's a great image related to: waifu`,
              imageUrl,
              conf.GURL
            ),
          },
          { quoted: ms }
        );
      }
    } catch (error) {
      repondre('Error retrieving data: ' + error.message);
    }
  }
);

// Blowjob Command
keith(
  {
    nomCom: "blowjob",
    categorie: "images",
    reaction: "🙄",
  },
  async (origineMessage, zk, commandeOptions) => {
    const { repondre, ms } = commandeOptions;
    const url = 'https://api.waifu.pics/nsfw/blowjob';

    try {
      for (let i = 0; i < 5; i++) {
        const response = await axios.get(url);
        const imageUrl = response.data.url;

        await zk.sendMessage(
          origineMessage,
          {
            image: { url: imageUrl },
            caption: `*Downloaded by ${conf.BOT}*`,
            contextInfo: buildContextInfo(
              "Image Search Result",
              `Here's a great image related to: waifu`,
              imageUrl,
              conf.GURL
            ),
          },
          { quoted: ms }
        );
      }
    } catch (error) {
      repondre('Error retrieving data: ' + error.message);
    }
  }
);
