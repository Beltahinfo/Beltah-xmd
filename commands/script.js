// Imports
const axios = require("axios");
const { keith } = require(__dirname + "/../keizzah/keith");
const { format } = require(__dirname + "/../keizzah/mesfonctions");
const os = require('os');
const moment = require("moment-timezone");
const conf = require(__dirname + "/../set");

// Constants
const DEFAULTS = {
  PARTICIPANT: '0@s.whatsapp.net',
  REMOTE_JID: 'status@broadcast',
  THUMBNAIL_URL: 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg',
  TITLE: "𝐓𝐄𝐂𝐇 𝐓𝐄𝐀𝐌 𝐁𝐄𝐋𝐓𝐀𝐇",
  BODY: "𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐈𝐍𝐆 𝐘𝐎𝐔 𝐓𝐎 𝐓𝐇𝐄 𝐖𝐎𝐑𝐋𝐃 🌐"
};

// Default message configuration
const DEFAULT_MESSAGE = {
  key: {
    fromMe: false,
    participant: DEFAULTS.PARTICIPANT,
    remoteJid: DEFAULTS.REMOTE_JID,
  },
  message: {
    contactMessage: {
      displayName: `Beltah Tech Info`,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;BELTAH MD;;;\nFN:BELTAH MD\nitem1.TEL;waid=${DEFAULTS.PARTICIPANT.split('@')[0]}:${DEFAULTS.PARTICIPANT.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
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
 * @param {string} [title=DEFAULTS.TITLE] - Title for the external ad reply.
 * @param {string} [userJid=DEFAULTS.PARTICIPANT] - User JID to mention.
 * @param {string} [thumbnailUrl=DEFAULTS.THUMBNAIL_URL] - Thumbnail URL.
 * @returns {object} - ContextInfo object.
 */
function getContextInfo(
  title = DEFAULTS.TITLE,
  userJid = DEFAULTS.PARTICIPANT,
  thumbnailUrl = DEFAULTS.THUMBNAIL_URL
) {
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
        title,
        body: DEFAULTS.BODY,
        thumbnailUrl,
        sourceUrl: conf.GURL || '',
      },
    };
  } catch (error) {
    console.error(`Error in getContextInfo: ${error.message}`);
    return {}; // Prevent breaking on error
  }
}

// Command Handler
keith(
  {
    nomCom: 'repo',
    aliases: ['script', 'sc'],
    reaction: '🚸',
    nomFichier: __filename,
  },
  async (command, reply, context) => {
    const { repondre, auteurMessage, nomAuteurMessage } = context;

    try {
      const response = await axios.get('https://api.github.com/repos/Beltah254/X-BOT');
      const repoData = response.data;

      if (repoData) {
        const repoInfo = {
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          owner: repoData.owner.login,
          updated: new Date(repoData.updated_at).toLocaleDateString('en-GB'),
          created: new Date(repoData.created_at).toLocaleDateString('en-GB'),
        };

        const uptimeSeconds = Math.floor(process.uptime());
        const formattedUptime = formatRuntime(uptimeSeconds);

        const message = `🤖 *${conf.BOT} WhatsApp Bot Information*\n\n` +
          `📌 *Uptime*: ${formattedUptime}\n` +
          `⭐ *Total Stars*: ${repoInfo.stars}\n` +
          `🍴 *Total Forks*: ${repoInfo.forks}\n` +
          `👤 *Repository Owner*: ${repoInfo.owner}\n\n` +
          `📆 *Repository Created*: ${repoInfo.created}\n` +
          `📆 *Last Updated*: ${repoInfo.updated}\n\n` +
          `🔗 *Repository Link*: ${repoData.html_url}\n` +
          `✅ *Session ID*: https://bel-tah-md-codes.onrender.com\n\n` +
          `Thank you, ${nomAuteurMessage}, for your interest in our project. Don't forget to ⭐ star our repository for updates and improvements!\n\n` +
          `> Powered by *Beltah Tech Team* 🚀`;

        await reply.sendMessage(
          command,
          {
            text: message,
            contextInfo: getContextInfo(
              "BELTAH-MD REPO",
              auteurMessage,
              DEFAULTS.THUMBNAIL_URL
            ),
          },
          { quoted: DEFAULT_MESSAGE }
        );
      } else {
        repondre('An error occurred while fetching the repository data.');
      }
    } catch (error) {
      console.error('Error fetching repository data:', error);
      repondre('An error occurred while fetching the repository data.');
    }
  }
);
