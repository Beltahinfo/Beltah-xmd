const { keith } = require('../keizzah/keith');
const Heroku = require('heroku-client');
const settings = require("../set");
const axios = require("axios");
const speed = require("performance-now");
const { exec } = require("child_process");
const { repondre } = require(__dirname + "/../keizzah/context");

// Constants
const DEFAULT_PARTICIPANT = '0@s.whatsapp.net';
const DEFAULT_REMOTE_JID = 'status@broadcast';
const DEFAULT_THUMBNAIL_URL = 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg';
const DEFAULT_TITLE = "𝗕𝗘𝗟𝗧𝗔𝗛 𝗠𝗨𝗟𝗧𝗜 𝗗𝗘𝗩𝗜𝗖𝗘";
const DEFAULT_BODY = "𝗜𝘁 𝗶𝘀 𝗻𝗼𝘁 𝘆𝗲𝘁 𝘂𝗻𝘁𝗶𝗹 𝗶𝘁 𝗶𝘀 𝗱𝗼𝗻𝗲🗿";

// Default message configuration
const fgg = {
  key: {
    fromMe: false,
    participant: DEFAULT_PARTICIPANT,
    remoteJid: DEFAULT_REMOTE_JID,
  },
  message: {
    contactMessage: {
      displayName: `BELTAH MD`,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;BELTAH MD;;;\nFN:BELTAH MD\nitem1.TEL;waid=${DEFAULT_PARTICIPANT.split('@')[0]}:${DEFAULT_PARTICIPANT.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
    },
  },
};

// Utility Functions
/**
 * Format runtime into a clean string.
 * @param {number} seconds - The runtime in seconds.
 * @returns {string} - Formatted runtime string.
 */
function formatRuntime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = Math.floor(seconds % 60);
  return `*${hours}h ${minutes}m ${secondsLeft}s*`;
}

/**
 * Construct contextInfo object for messages.
 * @param {string} title - Title for the external ad reply.
 * @param {string} userJid - User JID to mention.
 * @param {string} thumbnailUrl - Thumbnail URL.
 * @returns {object} - ContextInfo object.
 */
function getContextInfo(title = DEFAULT_TITLE, userJid = DEFAULT_PARTICIPANT, thumbnailUrl = DEFAULT_THUMBNAIL_URL) {
  try {
    return {
      mentionedJid: [userJid],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
         newsletterJid: "120363249464136503@newsletter",
         newsletterName: "🤖 𝐁𝐄𝐋𝐓𝐀𝐇 𝐀𝐈 𝐂𝐇𝐀𝐓𝐁𝐎𝐓 🤖",
         serverMessageId: Math.floor(100000 + Math.random() * 900000),
     },
      externalAdReply: {
        showAdAttribution: true,
        title,
        body: DEFAULT_BODY,
        thumbnailUrl,
        sourceUrl: settings.GURL || '',
      },
    };
  } catch (error) {
    console.error(`Error in getContextInfo: ${error.message}`);
    return {}; // Prevent breaking on error
  }
}

// Commands
// Ping Command
keith(
  {
    nomCom: 'ping',
    aliases: ['speed', 'latency'],
    desc: 'To check bot response time',
    categorie: 'system',
    reaction: '👻',
    fromMe: true,
  },
  async (dest, zk) => {
    try {
      // Show loading animation
      await zk.sendPresenceUpdate('composing', dest); // Simulate typing
      await zk.sendMessage(
        dest,
        { text: "🔄 Checking ping... Please wait.", contextInfo: getContextInfo() },
        { quoted: fgg }
      );

      const start = Date.now();
      const latency = Date.now() - start;

      const pingMessage = `*📡 PING RESULTS 📡*\n\n` +
                          `*🌐 Latency:* ${latency}ms\n` +
                          `> *⚡ Powered by Beltah Tech Team*`;

            // Removed contextInfo from this sendMessage as requested
      await zk.sendMessage(
        dest,
        { text: pingMessage },
        { quoted: fgg }
      );
    } catch (error) {
      console.error(`Error in ping command: ${error.message}`);
      await zk.sendMessage(dest, {
        text: `⚠️ An error occurred while processing the ping command. Please try again later.`,
      });
    }
  }
);

// Uptime Command
keith(
  {
    nomCom: 'uptime',
    aliases: ['runtime', 'running'],
    desc: 'To check runtime',
    categorie: 'system',
    reaction: '⚠️',
    fromMe: true,
  },
  async (dest, zk) => {
    try {
      // Show loading animation
      await zk.sendPresenceUpdate('composing', dest); // Simulate typing
      await zk.sendMessage(
        dest,
        { text: "🔄 Calculating uptime... Please wait.", contextInfo: getContextInfo() },
        { quoted: fgg }
      );

      const botUptime = process.uptime(); // Uptime in seconds
      const formattedUptime = formatRuntime(botUptime);

      const uptimeMessage = `*⏰ BOT UPTIME ⏰*\n\n` +
                            `*🛸 Uptime:* ${formattedUptime}\n` +
                            `> *⚡ Powered by Beltah Tech Team*`;

            // Removed contextInfo from this sendMessage as requested
      await zk.sendMessage(
        dest,
        { text: uptimeMessage },
        { quoted: fgg }
      );
    } catch (error) {
      console.error(`Error in uptime command: ${error.message}`);
      await zk.sendMessage(dest, {
        text: `⚠️ An error occurred while processing the uptime command. Please try again later.`,
      });
    }
  }
); 
/*// Ping Command
keith(
  {
    nomCom: 'ping',
    aliases: ['speed', 'latency'],
    desc: 'To check bot response time',
    categorie: 'system',
    reaction: '👻',
    fromMe: true,
  },
  async (dest, zk) => {
    try {
      const start = Date.now();
      await zk.sendPresenceUpdate('composing', dest); // Simulate typing
      const latency = Date.now() - start;

      const pingMessage = `*📡 PING RESULTS 📡*\n\n` +
                          `*🌐 Latency:* ${latency}ms\n` +
                          `> *⚡ Powered by Beltah Tech Team*`;

      await zk.sendMessage(
        dest,
        { text: pingMessage, contextInfo: getContextInfo("Ping Command Results") },
        { quoted: fgg }
      );
    } catch (error) {
      console.error(`Error in ping command: ${error.message}`);
      await zk.sendMessage(dest, {
        text: `⚠️ An error occurred while processing the ping command. Please try again later.`,
      });
    }
  }
);

// Uptime Command
keith(
  {
    nomCom: 'uptime',
    aliases: ['runtime', 'running'],
    desc: 'To check runtime',
    categorie: 'system',
    reaction: '⚠️',
    fromMe: true,
  },
  async (dest, zk) => {
    try {
      const botUptime = process.uptime(); // Uptime in seconds
      const formattedUptime = formatRuntime(botUptime);

      const uptimeMessage = `*⏰ BOT UPTIME ⏰*\n\n` +
                            `*🛸 Uptime:* ${formattedUptime}\n` +
                            `> *⚡ Powered by Beltah Tech Team*`;

      await zk.sendMessage(
        dest,
        { text: uptimeMessage, contextInfo: getContextInfo("Uptime Command Results") },
        { quoted: fgg }
      );
    } catch (error) {
      console.error(`Error in uptime command: ${error.message}`);
      await zk.sendMessage(dest, {
        text: `⚠️ An error occurred while processing the uptime command. Please try again later.`,
      });
    }
  }
);*/

module.exports = {
  getContextInfo,
};
