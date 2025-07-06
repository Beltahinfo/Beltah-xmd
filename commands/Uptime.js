const { keith } = require('../keizzah/keith');
const Heroku = require('heroku-client');
const settings = require("../set");
const axios = require("axios");
const speed = require("performance-now");
const { exec } = require("child_process");
const { repondre } = require(__dirname + "/../keizzah/context");

// ===== Constants =====
const DEFAULT_PARTICIPANT = '0@s.whatsapp.net';
const DEFAULT_REMOTE_JID = 'status@broadcast';

// ===== Commands =====

// Utility to build fgg with custom profile picture URL
async function getFggWithUserProfilePic(zk, dest) {
  let ppUrl;
  try {
    ppUrl = await zk.profilePictureUrl(dest, 'image');
  } catch {
    ppUrl = null;
  }
  return {
    key: {
      fromMe: false,
      participant: DEFAULT_PARTICIPANT,
      remoteJid: DEFAULT_REMOTE_JID,
    },
    message: {
      contactMessage: {
        displayName: `Powering Excellent Automation`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;BELTAH MD;;;\nFN:BELTAH MD\nitem1.TEL;waid=${DEFAULT_PARTICIPANT.split('@')[0]}:${DEFAULT_PARTICIPANT.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
        jpegThumbnail: ppUrl ? await getImageBuffer(ppUrl) : undefined,
      },
    },
  };
}

// Helper to fetch image buffer from URL
async function getImageBuffer(url) {
  const { data } = await axios.get(url, { responseType: "arraybuffer" });
  return data;
}

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

// --- Ping Command ---
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
      const latency = Date.now() - start;

      const pingMessage = `*BELTAH-MD Latency:* ${latency}ms\n`;

      const fgg = await getFggWithUserProfilePic(zk, dest);

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

// --- Uptime Command ---
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

      const uptimeMessage = `*BELTAH-MD UPTIME :* ${formattedUptime}\n`;

      const fgg = await getFggWithUserProfilePic(zk, dest);

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

module.exports = {
  formatRuntime,
  getFggWithUserProfilePic,
};
