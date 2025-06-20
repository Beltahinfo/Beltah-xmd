const { keith } = require('../keizzah/keith');
const Heroku = require('heroku-client');
const settings = require("../set");
const axios = require("axios");
const speed = require("performance-now");
const { exec } = require("child_process");
const { repondre } = require(__dirname + "/../keizzah/context");

// Function to create a delay
function delay(ms) {
  console.log(`⏱️ Delay for ${ms}ms`);
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Format the uptime into a human-readable string
function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = Math.floor(seconds % 60);

  return `BOT UPTIME : 0 ᴅᴀʏs, ${hours} ʜᴏᴜʀs, ${minutes} ᴍɪɴᴜᴛᴇs, ${secondsLeft} sᴇᴄᴏɴᴅs`;
}

// Constants
const DEFAULT_PARTICIPANT = '0@s.whatsapp.net';
const DEFAULT_REMOTE_JID = 'status@broadcast';
const DEFAULT_THUMBNAIL_URL = 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg';
const DEFAULT_TITLE = "BELTAH TECH BOT";
const DEFAULT_BODY = "Your AI Assistant Chuddy Buddy";

// Default message configuration
const fgg = {
  key: {
    fromMe: false,
    participant: DEFAULT_PARTICIPANT,
    remoteJid: DEFAULT_REMOTE_JID,
  },
  message: {
    contactMessage: {
      displayName: `Beltah Tech Info`,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;BELTAH MD;;;\nFN:BELTAH MD\nitem1.TEL;waid=${DEFAULT_PARTICIPANT.split('@')[0]}:${DEFAULT_PARTICIPANT.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
    },
  },
};

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
        sourceUrl: conf.GURL || '',
      },
    };
  } catch (error) {
    console.error(`Error in getContextInfo: ${error.message}`);
    return {}; // Prevent breaking on error
  }
           }


// Command to restart the bot
keith({
  nomCom: 'restart',
  aliases: ['reboot'],
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  // Check if the user is a super user
  if (!superUser) {
    return repondre("You need owner privileges to execute this command!");
  }

  try {
    // Inform the user that the bot is restarting
    await repondre("> *BELTAH-MD is Restarting from the server...*");

    // Wait for 3 seconds before restarting
    await delay(3000);

    // Exit the process to restart the bot
    process.exit();
  } catch (error) {
    console.error("Error during restart:", error);
  }
});

// Command to retrieve Heroku config vars
keith({
  nomCom: 'allvar',
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  // Check if the command is issued by the owner
  if (!superUser) {
    return repondre("*This command is restricted to the bot owner or Beltah Tech owner 💀*");
  }

  const appName = settings.HEROKU_APP_NAME;
  const herokuApiKey = settings.HEROKU_API_KEY;

  const heroku = new Heroku({
    token: herokuApiKey,
  });

  const baseURI = `/apps/${appName}/config-vars`;

  try {
    // Fetch config vars from Heroku API
    const configVars = await heroku.get(baseURI);

    let responseMessage = '*╭───༺𝗕𝗘𝗟𝗧𝗔𝗛-𝗠𝗗  𝗔𝗟𝗟 𝗩𝗔𝗥༻────╮*\n\n';
    
    // Loop through the returned config vars and format them
    for (let key in configVars) {
      if (configVars.hasOwnProperty(key)) {
        responseMessage += `★ *${key}* = ${configVars[key]}\n`;
      }
    }

    // Send the formatted response back to the user
    repondre(responseMessage);

  } catch (error) {
    console.error('Error fetching Heroku config vars:', error);
    repondre('Sorry, there was an error fetching the config vars.');
  }
});

// Command to set a Heroku config var
keith({
  nomCom: 'setvar',
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser, arg } = context;

  // Check if the command is issued by the owner
  if (!superUser) {
    return repondre("*This command is restricted to the bot owner or Beltah Tech*");
  }

  const appName = settings.HEROKU_APP_NAME;
  const herokuApiKey = settings.HEROKU_API_KEY;

  if (!arg || arg.length !== 1 || !arg[0].includes('=')) {
    return repondre('Incorrect Usage:\nProvide the key and value correctly.\nExamples: \n\n> setvar OWNER_NAME=Beltah Tech\n> setvar AUTO_READ_MESSAGES=no');
  }

  const [key, value] = arg[0].split('=');

  const heroku = new Heroku({
    token: herokuApiKey,
  });

  const baseURI = `/apps/${appName}/config-vars`;

  try {
    // Set the new config var
    await heroku.patch(baseURI, {
      body: {
        [key]: value,
      },
    });

    // Notify success
    await repondre(`*✅ The variable ${key} = ${value} has been set successfully. The bot is restarting...*`);
  } catch (error) {
    console.error('Error setting config variable:', error);
    await repondre(`❌ There was an error setting the variable. Please try again later.\n${error.message}`);
  }
});

// Command to execute shell commands
keith({
  nomCom: "shell",
  aliases: ["getcmd", "cmd"],
  reaction: '🗿',
  categorie: "system"
}, async (context, message, params) => {
  const { repondre: sendResponse, arg: commandArgs, superUser: Owner, auteurMessage } = params;

  // Ensure that the sender is the superuser (Owner)
  if (!Owner) {
    return sendResponse("You are not authorized to execute shell commands.");
  }

  const command = commandArgs.join(" ").trim();

  // Ensure the command is not empty
  if (!command) {
    return sendResponse("Please provide a valid shell command.");
  }

  // Execute the shell command
  exec(command, (err, stdout, stderr) => {
    if (err) {
      return sendResponse(`Error: ${err.message}`);
    }

    if (stderr) {
      return sendResponse(`stderr: ${stderr}`);
    }

    if (stdout) {
      return sendResponse(stdout);
    }

    // If there's no output, let the user know
    return sendResponse("Command executed successfully, but no output was returned.");
  });
});


// Command to update and redeploy the bot in a clear, user-friendly way
keith({
  nomCom: 'update',
  aliases: ['redeploy', 'sync'],
  categorie: "system",
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  // Only allow the bot owner to use this command
  if (!superUser) {
    return repondre("❌ Access Denied: Only the bot owner can run this command.");
  }

  // Get Heroku app credentials from settings
  const herokuAppName = settings.HEROKU_APP_NAME;
  const herokuApiKey = settings.HEROKU_API_KEY;

  // Ensure Heroku credentials are set
  if (!herokuAppName || !herokuApiKey) {
    await repondre(
      "❌ Configuration Missing:\n\n" +
      "Please check that `HEROKU_APP_NAME` and `HEROKU_API_KEY` are set in your environment variables."
    );
    return;
  }

  // Main redeployment logic
  async function redeployApp() {
    const herokuUrl = `https://api.heroku.com/apps/${herokuAppName}/builds`;
    const sourceBlobUrl = "https://github.com/Beltahinfo/Beltah-xmd/tarball/main";

    try {
      // Announce start
      await repondre(
        "🚀 Updating Beltah Tech Bot...\n\n" +
        "This may take a few minutes. Please wait while the update is applied."
      );

      // Trigger the Heroku build via API
      const response = await axios.post(
        herokuUrl,
        { source_blob: { url: sourceBlobUrl } },
        {
          headers: {
            Authorization: `Bearer ${herokuApiKey}`,
            Accept: "application/vnd.heroku+json; version=3",
          },
        }
      );

      // Optionally log for debugging
      console.log("Heroku Build Details:", response.data);

      // Final confirmation
      await repondre(
        "✅ The update has been successfully started! The bot may restart soon.\n" +
        "If you don’t see changes after a few minutes, please check your Heroku dashboard."
      );
    } catch (error) {
      // Handle errors clearly
      const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred.";
      await repondre(
        `❌ Update Failed:\n\n` +
        `Error: ${errorMessage}\n\n` +
        "Please check your Heroku configuration and try again."
      );
      console.error("Error triggering Heroku redeploy:", errorMessage);
    }
  }

  // Run the redeployment process
  try {
    await redeployApp();
  } catch (error) {
    console.error("Unexpected error during redeployment:", error.message);
    await repondre(
      "❌ Critical Error:\n\n" +
      "There was an unexpected issue during the update process. Please try again after resolving the problem."
    );
  }
});
const { keith } = require('../keizzah/keith');
const axios = require('axios');

const { HEROKU_API_KEY, HEROKU_APP_NAME } = process.env;

module.exports = [
  {
    name: 'update',
    get flashOnly() {
      return keith();
    },
    description: 'Check for new GitHub commits and optionally trigger update.',
    category: 'HEROKU',
    ownerOnly: true,

    execute: async (bot, msg, args) => {
      const fromJid = msg.key?.remoteJid || msg.chat || msg.from;

      if (!HEROKU_API_KEY || !HEROKU_APP_NAME) {
        return bot.sendMessage(fromJid, {
          text: '⚠️ HEROKU_API_KEY or HEROKU_APP_NAME is not set in environment.'
        }, { quoted: msg });
      }

      const subcommand = args[0]?.toLowerCase();

      try {
        if (subcommand === 'now') {
          await bot.sendMessage(fromJid, {
            text: '🚀 Updating bot now. Please wait 1-2 minutes...'
          }, { quoted: msg });

          await axios.post(
            `https://api.heroku.com/apps/${HEROKU_APP_NAME}/builds`,
            {
              source_blob: {
                url: 'https://github.com/Beltahinfo/Beltah-xmd/tarball/main'
              }
            },
            {
              headers: {
                Authorization: `Bearer ${HEROKU_API_KEY}`,
                Accept: 'application/vnd.heroku+json; version=3',
                'Content-Type': 'application/json'
              }
            }
          );

          return bot.sendMessage(fromJid, {
            text: '✅ Redeploy triggered successfully!'
          }, { quoted: msg });

        } else {
          // Get latest commit info from GitHub
          const githubRes = await axios.get(
            'https://api.github.com/repos/Beltahinfo/Beltah-xmd/commits/main'
          );
          const latestCommit = githubRes.data;
          const latestSha = latestCommit.sha;

          // Get last build info from Heroku
          const herokuRes = await axios.get(
            `https://api.heroku.com/apps/${HEROKU_APP_NAME}/builds`,
            {
              headers: {
                Authorization: `Bearer ${HEROKU_API_KEY}`,
                Accept: 'application/vnd.heroku+json; version=3'
              }
            }
          );

          const lastBuild = herokuRes.data[0];
          const deployedSha = lastBuild?.source_blob?.url || '';
          const alreadyDeployed = deployedSha.includes(latestSha);

          if (alreadyDeployed) {
            return bot.sendMessage(fromJid, {
              text: '✅ Bot is already up to date with the latest commit.'
            }, { quoted: msg });
          }

          return bot.sendMessage(fromJid, {
            text: `🆕 New commit found!\n\n*Message:* ${latestCommit.commit.message}\n*Author:* ${latestCommit.commit.author.name}\n\nType *update now* to update your bot.`
          }, { quoted: msg });
        }
      } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        console.error('Update failed:', errMsg);
        return bot.sendMessage(fromJid, {
          text: `❌ Error: ${errMsg}`
        }, { quoted: msg });
      }
    }
  }
];
