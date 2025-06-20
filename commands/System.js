/**
 * System Commands for Beltah Tech Bot
 * Handles restart, Heroku config, shell, and update operations.
 */

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
const DEFAULT_TITLE = "BELTAH TECH BOT";
const DEFAULT_BODY = "Your AI Assistant Chuddy Buddy";

// Utility: Delay
function delay(ms) {
  console.log(`⏱️ Delay for ${ms}ms`);
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility: Format Uptime
function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = Math.floor(seconds % 60);
  return `BOT UPTIME : 0 ᴅᴀʏs, ${hours} ʜᴏᴜʀs, ${minutes} ᴍɪɴᴜᴛᴇs, ${secondsLeft} sᴇᴄᴏɴᴅs`;
}

// Default contact message configuration
const fgg = {
  key: {
    fromMe: false,
    participant: DEFAULT_PARTICIPANT,
    remoteJid: DEFAULT_REMOTE_JID,
  },
  message: {
    contactMessage: {
      displayName: `Beltah Tech Info`,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN;BELTAH MD;;;\nFN:BELTAH MD\nitem1.TEL;waid=${DEFAULT_PARTICIPANT.split('@')[0]}:${DEFAULT_PARTICIPANT.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
    },
  },
};

/**
 * Constructs a WhatsApp contextInfo object for external ad replies.
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
        sourceUrl: (typeof conf !== "undefined" && conf.GURL) ? conf.GURL : "",
      },
    };
  } catch (error) {
    console.error(`Error in getContextInfo: ${error.message}`);
    return {};
  }
}

// --- SYSTEM COMMANDS ---

// Restart Command
keith({
  nomCom: 'restart',
  aliases: ['reboot'],
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;
  if (!superUser) {
    return repondre("You need owner privileges to execute this command!");
  }
  try {
    await repondre("> *BELTAH-MD is Restarting from the server...*");
    await delay(3000);
    process.exit();
  } catch (error) {
    console.error("Error during restart:", error);
  }
});

// Heroku Config Vars: List All
keith({
  nomCom: 'allvar',
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;
  if (!superUser) {
    return repondre("*This command is restricted to the bot owner or Beltah Tech owner 💀*");
  }
  const appName = settings.HEROKU_APP_NAME;
  const herokuApiKey = settings.HEROKU_API_KEY;

  const heroku = new Heroku({ token: herokuApiKey });
  const baseURI = `/apps/${appName}/config-vars`;

  try {
    const configVars = await heroku.get(baseURI);
    let responseMessage = '*╭───༺𝗕𝗘𝗟𝗧𝗔𝗛-𝗠𝗗  𝗔𝗟𝗟 𝗩𝗔𝗥༻────╮*\n\n';
    for (let key in configVars) {
      if (configVars.hasOwnProperty(key)) {
        responseMessage += `★ *${key}* = ${configVars[key]}\n`;
      }
    }
    repondre(responseMessage);
  } catch (error) {
    console.error('Error fetching Heroku config vars:', error);
    repondre('Sorry, there was an error fetching the config vars.');
  }
});

// Heroku Config Vars: Set
keith({
  nomCom: 'setvar',
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser, arg } = context;
  if (!superUser) {
    return repondre("*This command is restricted to the bot owner or Beltah Tech*");
  }
  const appName = settings.HEROKU_APP_NAME;
  const herokuApiKey = settings.HEROKU_API_KEY;

  if (!arg || arg.length !== 1 || !arg[0].includes('=')) {
    return repondre('Incorrect Usage:\nProvide the key and value correctly.\nExamples: \n\n> setvar OWNER_NAME=Beltah Tech\n> setvar AUTO_READ_MESSAGES=no');
  }

  const [key, value] = arg[0].split('=');

  const heroku = new Heroku({ token: herokuApiKey });
  const baseURI = `/apps/${appName}/config-vars`;

  try {
    await heroku.patch(baseURI, { body: { [key]: value } });
    await repondre(`*✅ The variable ${key} = ${value} has been set successfully. The bot is restarting...*`);
  } catch (error) {
    console.error('Error setting config variable:', error);
    await repondre(`❌ There was an error setting the variable. Please try again later.\n${error.message}`);
  }
});

// Shell Command Execution
keith({
  nomCom: "shell",
  aliases: ["getcmd", "cmd"],
  reaction: '🗿',
  categorie: "system"
}, async (context, message, params) => {
  const { repondre: sendResponse, arg: commandArgs, superUser: Owner } = params;
  if (!Owner) {
    return sendResponse("You are not authorized to execute shell commands.");
  }
  const command = commandArgs.join(" ").trim();
  if (!command) {
    return sendResponse("Please provide a valid shell command.");
  }
  exec(command, (err, stdout, stderr) => {
    if (err) return sendResponse(`Error: ${err.message}`);
    if (stderr) return sendResponse(`stderr: ${stderr}`);
    if (stdout) return sendResponse(stdout);
    return sendResponse("Command executed successfully, but no output was returned.");
  });
});

// Update/Redeploy Command
keith({
  nomCom: 'update',
  aliases: ['redeploy', 'sync'],
  categorie: "system",
}, async (chatId, zk, context) => {
  const { repondre, superUser, arg } = context;
  if (!superUser) {
    return repondre("❌ Access Denied: Only the bot owner can run this command.");
  }

  const herokuAppName = settings.HEROKU_APP_NAME;
  const herokuApiKey = settings.HEROKU_API_KEY;

  if (!herokuAppName || !herokuApiKey) {
    await repondre(
      "❌ Configuration Missing:\n\n" +
      "Please check that `HEROKU_APP_NAME` and `HEROKU_API_KEY` are set in your environment variables."
    );
    return;
  }

  const subcommand = arg && arg[0] ? arg[0].toLowerCase() : null;

  try {
    if (subcommand === 'now') {
      await repondre('🚀 Updating bot now. Please wait 1-2 minutes...');

      await axios.post(
        `https://api.heroku.com/apps/${herokuAppName}/builds`,
        { source_blob: { url: 'https://github.com/Beltahinfo/Beltah-xmd/tarball/main' } },
        {
          headers: {
            Authorization: `Bearer ${herokuApiKey}`,
            Accept: 'application/vnd.heroku+json; version=3',
            'Content-Type': 'application/json'
          }
        }
      );

      return repondre('✅ Redeploy triggered successfully!');
    } else {
      // Get latest commit info from GitHub
      const githubRes = await axios.get(
        'https://api.github.com/repos/Beltahinfo/Beltah-xmd/commits/main'
      );
      const latestCommit = githubRes.data;
      const latestSha = latestCommit.sha;

      // Get last build info from Heroku
      const herokuRes = await axios.get(
        `https://api.heroku.com/apps/${herokuAppName}/builds`,
        {
          headers: {
            Authorization: `Bearer ${herokuApiKey}`,
            Accept: 'application/vnd.heroku+json; version=3'
          }
        }
      );

      const lastBuild = herokuRes.data[0];
      const deployedSha = lastBuild?.source_blob?.url || '';
      const alreadyDeployed = deployedSha.includes(latestSha);

      if (alreadyDeployed) {
        return repondre('✅ Bot is already up to date with the latest commit.');
      }

      return repondre(
        `🆕 New commit found!\n\n*Message:* ${latestCommit.commit.message}\n*Author:* ${latestCommit.commit.author.name}\n\nType *update now* to update your bot.`
      );
    }
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    console.error('Update failed:', errMsg);
    return repondre(`❌ Error: ${errMsg}`);
  }
});
