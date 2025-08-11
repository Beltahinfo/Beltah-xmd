const { keith } = require('../keizzah/keith');
const Heroku = require('heroku-client');
const s = require("../set");
const axios = require("axios");
const { exec } = require("child_process");
const settings = require(__dirname + "/../set");

// Professional Loading Animation
async function loading(dest, zk, quotedMsg) {
  const frames = [
    "▉         10% | Initializing...",
    "▉▉        20% | Connecting...",
    "▉▉▉       30% | Fetching resources...",
    "▉▉▉▉      40% | Processing...",
    "▉▉▉▉▉     50% | Halfway there...",
    "▉▉▉▉▉▉    60% | Optimizing...",
    "▉▉▉▉▉▉▉   70% | Applying changes...",
    "▉▉▉▉▉▉▉▉  80% | Finalizing...",
    "▉▉▉▉▉▉▉▉▉ 90% | Almost done...",
    "▉▉▉▉▉▉▉▉▉▉ 100% | Complete!",
    "✅ Operation successful!"
  ];
  let { key } = await zk.sendMessage(dest, {
    text: "🔄 Loading, please wait...",
    contextInfo: {
      mentionedJid: [dest],
      externalAdReply: {
        title: `${settings.BOT} Menu`,
        body: `By ${settings.OWNER_NAME}`,
        thumbnailUrl: settings.URL,
        sourceUrl: settings.GURL,
        mediaType: 1,
        renderLargerThumbnail: false // Changed to small thumbnail
      }
    }
  }, { quoted: quotedMsg });
  for (const frame of frames) {
    await zk.sendMessage(dest, {
      text: frame,
      edit: key,
      contextInfo: {
        mentionedJid: [dest],
        externalAdReply: {
          title: `${settings.BOT} Menu`,
          body: `By ${settings.OWNER_NAME}`,
          thumbnailUrl: settings.URL,
          sourceUrl: settings.GURL,
          mediaType: 1,
          renderLargerThumbnail: false // Changed to small thumbnail
        }
      }
    }, { quoted: quotedMsg });
    await delay(450);
  }
}

// Delay simulation
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Uptime formatter
function runtime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${secondsLeft}s`;
}

// Command: test/alive/testing
keith({
  nomCom: "test",
  aliases: ["alive", "testing"],
  categorie: "system",
  reaction: "🌏"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;
  const audioFiles = [
    'https://files.catbox.moe/hpwsi2.mp3',
    'https://files.catbox.moe/xci982.mp3',
    'https://files.catbox.moe/utbujd.mp3',
    'https://files.catbox.moe/w2j17k.m4a',
    'https://files.catbox.moe/851skv.m4a',
    'https://files.catbox.moe/qnhtbu.m4a',
    'https://files.catbox.moe/lb0x7w.mp3',
    'https://files.catbox.moe/efmcxm.mp3',
    'https://files.catbox.moe/gco5bq.mp3',
    'https://files.catbox.moe/26oeeh.mp3',
    'https://files.catbox.moe/a1sh4u.mp3',
    'https://files.catbox.moe/vuuvwn.m4a',
    'https://files.catbox.moe/wx8q6h.mp3',
    'https://files.catbox.moe/uj8fps.m4a',
    'https://files.catbox.moe/dc88bx.m4a',
    'https://files.catbox.moe/tn32z0.m4a'
  ];
  const selectedAudio = audioFiles[Math.floor(Math.random() * audioFiles.length)];
  const menuMessage = '🟢 BELTAH-MD ONLINE 🟢';
  await zk.sendMessage(dest, {
    audio: { url: selectedAudio },
    mimetype: 'audio/mpeg',
    ptt: true,
    waveform: [100, 0, 100, 0, 100, 0, 100],
    fileName: 'shizo',
    contextInfo: {
      mentionedJid: [dest],
      externalAdReply: {
        title: `${settings.BOT} Menu`,
        body: `By ${settings.OWNER_NAME}`,
        thumbnailUrl: settings.URL,
        sourceUrl: settings.GURL,
        mediaType: 1,
        renderLargerThumbnail: false // Changed to small thumbnail
      }
    }
  }, { quoted: ms });
});

// Command: restart/reboot
keith({
  nomCom: 'restart',
  aliases: ['reboot'],
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser, ms } = context;
  if (!superUser) return repondre("You need owner privileges to execute this command!");
  try {
    const menuMessage = "*Restarting...*";
    await zk.sendMessage(chatId, {
      text: menuMessage,
      contextInfo: {
        mentionedJid: [chatId],
        externalAdReply: {
          title: `${settings.BOT} Menu`,
          body: `By ${settings.OWNER_NAME}`,
          thumbnailUrl: settings.URL,
          sourceUrl: settings.GURL,
          mediaType: 1,
          renderLargerThumbnail: false // Changed to small thumbnail
        }
      }
    }, { quoted: ms });
    await delay(3000);
    process.exit();
  } catch (error) {
    console.error("Error during restart:", error);
  }
});

// Command: allvar (show Heroku config vars)
keith({
  nomCom: 'allvar',
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser, ms } = context;
  if (!superUser) return repondre("*This command is restricted to the bot owner*");
  const appname = s.HEROKU_APP_NAME;
  const herokuapi = s.HEROKU_API_KEY;
  const heroku = new Heroku({ token: herokuapi });
  const baseURI = `/apps/${appname}/config-vars`;
  try {
    const configVars = await heroku.get(baseURI);
    let str = '*╭───༺All my Heroku vars༻────╮*\n\n';
    for (let key in configVars) {
      if (configVars.hasOwnProperty(key)) {
        str += `★ *${key}* = ${configVars[key]}\n`;
      }
    }
    const menuMessage = str;
    await zk.sendMessage(chatId, {
      text: menuMessage,
      contextInfo: {
        mentionedJid: [chatId],
        externalAdReply: {
          title: `${settings.BOT} Menu`,
          body: `By ${settings.OWNER_NAME}`,
          thumbnailUrl: settings.URL,
          sourceUrl: settings.GURL,
          mediaType: 1,
          renderLargerThumbnail: false // Changed to small thumbnail
        }
      }
    }, { quoted: ms });
  } catch (error) {
    console.error('Error fetching Heroku config vars:', error);
    const menuMessage = 'Sorry, there was an error fetching the config vars.';
    await zk.sendMessage(chatId, {
      text: menuMessage,
      contextInfo: {
        mentionedJid: [chatId],
        externalAdReply: {
          title: `${settings.BOT} Menu`,
          body: `By ${settings.OWNER_NAME}`,
          thumbnailUrl: settings.URL,
          sourceUrl: settings.GURL,
          mediaType: 1,
          renderLargerThumbnail: false // Changed to small thumbnail
        }
      }
    }, { quoted: ms });
  }
});

// Command: setvar (set Heroku config var)
keith({
  nomCom: 'setvar',
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser, arg, ms } = context;
  if (!superUser) return repondre("*This command is restricted to the bot owner or Alpha owner 💀*");
  const appname = s.HEROKU_APP_NAME;
  const herokuapi = s.HEROKU_API_KEY;
  if (!arg || arg.length !== 1 || !arg[0].includes('=')) {
    const menuMessage = 'Incorrect Usage:\nProvide the key and value correctly.\nExample: setvar ANTICALL=yes';
    return zk.sendMessage(chatId, {
      text: menuMessage,
      contextInfo: {
        mentionedJid: [chatId],
        externalAdReply: {
          title: `${settings.BOT} Menu`,
          body: `By ${settings.OWNER_NAME}`,
          thumbnailUrl: settings.URL,
         
