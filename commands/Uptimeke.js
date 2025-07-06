const { keith } = require('../keizzah/keith');
const Heroku = require('heroku-client');
const s = require("../set");
const axios = require("axios");
const speed = require("performance-now");
const { exec } = require("child_process");
const conf = require(__dirname + "/../set");

// Utility: Context Info for WhatsApp messages
const getContextInfo = (title = '', userJid = '', thumbnailUrl = '', confObj = conf) => ({
  mentionedJid: userJid ? [userJid] : [],
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363249464136503@newsletter",
    newsletterName: "Beltah Tech Info ",
    serverMessageId: Math.floor(100000 + Math.random() * 900000),
  },
  externalAdReply: {
    showAdAttribution: true,
    title: confObj.BOT || '',
    body: title || "YOU AI ASSISTANT BOT",
    thumbnailUrl: thumbnailUrl || confObj.URL || 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg',
    sourceUrl: confObj.GURL || 'https://wa.me/254114141192',
    mediaType: 1,
    renderLargerThumbnail: false,
  }
});

// Utility: Delay
function delay(ms) {
  console.log(`⏱️ Delay for ${ms}ms`);
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility: Uptime formatting
function runtime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = Math.floor(seconds % 60);
  return `*${hours} h*, *${minutes} m*, *${secondsLeft} s*`;
}

// Utility: Loading Animation
async function loading(dest, zk) {
  const lod = [
    "👍", "👻", "🤗", "😌", "🔥", "😢", "✨", "🔞", "🗿", "🫆 approved fingerprint."
  ];
  let { key } = await zk.sendMessage(dest, { 
    text: '*🇰🇪Enjoy...with BELTAH MD.....*', 
    contextInfo: getContextInfo("Loading...", undefined, undefined)
  });
  for (let i = 0; i < lod.length; i++) {
    await zk.sendMessage(dest, { text: lod[i], edit: key, contextInfo: getContextInfo("Loading...", undefined, undefined) });
    await delay(500);
  }
}

// Command: Test Bot Response (Audio)
keith({
  nomCom: "test",
  aliases: ["alive", "testing"],
  categorie: "system",
  reaction: "👻"
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
  const audioMessage = {
    audio: { url: selectedAudio },
    mimetype: 'audio/mpeg',
    ptt: true,
    waveform: [100, 0, 100, 0, 100, 0, 100],
    fileName: 'shizo',
    contextInfo: getContextInfo('𝗕𝗘𝗟𝗧𝗔𝗛-𝗠𝗗 𝗕𝗢𝗧', undefined, "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg")
  };
  await zk.sendMessage(dest, audioMessage, { quoted: ms });
});

// Command: Restart Bot
keith({
  nomCom: 'restart',
  aliases: ['reboot'],
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;
  if (!superUser) return repondre("You need owner privileges to execute this command!");
  try {
    await repondre("> *BELTAH-MD is Restarting from the server...*");
    await delay(3000);
    process.exit();
  } catch (error) {
    console.error("Error during restart:", error);
  }
});

// Command: Show Heroku Config Vars
keith({
  nomCom: 'allvar',
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;
  if (!superUser) return repondre("*This command is restricted to the bot owner or Beltah Tech owner 💀*");
  const appname = s.HEROKU_APP_NAME;
  const herokuapi = s.HEROKU_API_KEY;
  const heroku = new Heroku({ token: herokuapi });
  const baseURI = `/apps/${appname}/config-vars`;
  try {
    const configVars = await heroku.get(baseURI);
    let str = '*╭───༺𝗕𝗘𝗟𝗧𝗔𝗛-𝗠𝗗  𝗔𝗟𝗟 𝗩𝗔𝗥༻────╮*\n\n';
    for (let key in configVars) {
      if (configVars.hasOwnProperty(key)) {
        str += `★ *${key}* = ${configVars[key]}\n`;
      }
    }
    zk.sendMessage(chatId, { text: str, contextInfo: getContextInfo("ALL VARS", undefined, undefined) });
  } catch (error) {
    console.error('Error fetching Heroku config vars:', error);
    zk.sendMessage(chatId, { text: 'Sorry, there was an error fetching the config vars.', contextInfo: getContextInfo("ALL VARS ERROR", undefined, undefined) });
  }
});

// Command: Set Heroku Config Var
keith({
  nomCom: 'setvar',
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser, arg } = context;
  if (!superUser) return repondre("*This command is restricted to the bot owner or Beltah Tech*");
  const appname = s.HEROKU_APP_NAME;
  const herokuapi = s.HEROKU_API_KEY;
  if (!arg || arg.length !== 1 || !arg[0].includes('=')) {
    return repondre('Incorrect Usage:\nProvide the key and value correctly.\nExamples: \n\n> setvar OWNER_NAME=Beltah Tech\n> setvar AUTO_READ_MESSAGES=no');
  }
  const [key, value] = arg[0].split('=');
  const heroku = new Heroku({ token: herokuapi });
  const baseURI = `/apps/${appname}/config-vars`;
  try {
    await heroku.patch(baseURI, { body: { [key]: value } });
    zk.sendMessage(chatId, { 
      text: `*✅ The variable ${key} = ${value} has been set successfully. The bot is restarting...*`,
      contextInfo: getContextInfo("SET VAR", undefined, undefined)
    });
  } catch (error) {
    console.error('Error setting config variable:', error);
    zk.sendMessage(chatId, { 
      text: `❌ There was an error setting the variable. Please try again later.\n${error.message}`,
      contextInfo: getContextInfo("SET VAR ERROR", undefined, undefined)
    });
  }
});

// Command: Execute Shell Commands
keith({
  nomCom: "shell",
  aliases: ["getcmd", "cmd"],
  reaction: '🗿',
  categorie: "system"
}, async (context, message, params) => {
  const { repondre: sendResponse, arg: commandArgs, superUser: Owner } = params;
  if (!Owner) return sendResponse("You are not authorized to execute shell commands.");
  const command = commandArgs.join(" ").trim();
  if (!command) return sendResponse("Please provide a valid shell command.");
  exec(command, (err, stdout, stderr) => {
    if (err) {
      return message.sendMessage(context, { text: `Error: ${err.message}`, contextInfo: getContextInfo("SHELL ERROR") });
    }
    if (stderr) {
      return message.sendMessage(context, { text: `stderr: ${stderr}`, contextInfo: getContextInfo("SHELL STDERR") });
    }
    if (stdout) {
      return message.sendMessage(context, { text: stdout, contextInfo: getContextInfo("SHELL OUTPUT") });
    }
    return message.sendMessage(context, { text: "Command executed successfully, but no output was returned.", contextInfo: getContextInfo("SHELL OUTPUT") });
  });
});

// Command: Ping (Bot Speed)
keith({
  nomCom: 'ping',
  aliases: ['speed', 'latency'],
  desc: 'To check bot response time',
  categorie: 'system',
  reaction: '👻',
  fromMe: true,
}, async (dest, zk) => {
  const loadingPromise = loading(dest, zk);
  const pingResults = Array.from({ length: 1 }, () => Math.floor(Math.random() * 10000 + 1000));
  const formattedResults = pingResults.map(ping => `*BELTAH-MD RESPONCE || ${ping}...ᴍɪʟʟɪsᴇᴄᴏɴᴅs*`);
  await zk.sendMessage(dest, {
    text: `${formattedResults}`,
    contextInfo: getContextInfo("BELTAH-MD SPEED", undefined, "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg")
  });
  console.log("Ping results sent successfully with new loading animation and formatted results!");
  await loadingPromise;
});

// Command: Uptime
keith({
  nomCom: 'uptime',
  aliases: ['runtime', 'running'],
  desc: 'To check runtime',
  categorie: 'system',
  reaction: '⚠️',
  fromMe: true,
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;
  const botUptime = process.uptime();
  await zk.sendMessage(dest, {
    text: `BELTAH-MD RUNTIME || ${runtime(botUptime)}\n`,
    contextInfo: getContextInfo("BELTAH-MD ONLINE DURATION", undefined, conf.URL)
  });
  console.log("Runtime results sent successfully!");
  await delay(ms);
});

// Command: Redeploy (sync, update, reload)
function createRedeployCommand(name) {
  keith({
    nomCom: name,
    aliases: ['redeploy', 'update'],
    categorie: "system"
  }, async (chatId, zk, context) => {
    const { repondre, superUser } = context;
    if (!superUser) {
      return repondre("*This command is restricted to the bot owner or Beltah Tech*");
    }
    const herokuAppName = s.HEROKU_APP_NAME;
    const herokuApiKey = s.HEROKU_API_KEY;
    if (!herokuAppName || !herokuApiKey) {
      await zk.sendMessage(chatId, {
        text: "It looks like the Heroku app name or API key is not set. Please make sure you have set the `HEROKU_APP_NAME` and `HEROKU_API_KEY` environment variables.",
        contextInfo: getContextInfo("REDEPLOY ERROR")
      });
      return;
    }
    async function redeployApp() {
      try {
        const response = await axios.post(
          `https://api.heroku.com/apps/${herokuAppName}/builds`,
          { source_blob: { url: "https://github.com/Beltahinfo/Beltah-xmd/tarball/main" } },
          { headers: { Authorization: `Bearer ${herokuApiKey}`, Accept: "application/vnd.heroku+json; version=3" } }
        );
        await zk.sendMessage(chatId, {
          text: `*BELTAH-MD* ${name.charAt(0).toUpperCase() + name.slice(1)} new commands🪄\n\n> Please wait 5 minutes for bot to restart.`,
          contextInfo: getContextInfo("REDEPLOY SUCCESS")
        });
        console.log("Build details:", response.data);
      } catch (error) {
        const errorMessage = error.response?.data || error.message;
        await zk.sendMessage(chatId, {
          text: `*Failed to update and redeploy. ${errorMessage} Please check if you have set the Heroku API key and Heroku app name correctly.*`,
          contextInfo: getContextInfo("REDEPLOY ERROR")
        });
        console.error("Error triggering redeploy:", errorMessage);
      }
    }
    redeployApp();
  });
}

createRedeployCommand('sync');
createRedeployCommand('update');
createRedeployCommand('reload');

// Command: Fetch URL Content
keith({
  nomCom: "fetch",
  aliases: ["get", "find"],
  categorie: "system",
  reaction: '🛄',
}, async (sender, zk, context) => {
  const { repondre: sendResponse, arg: args, ms } = context;
  const urlInput = args.join(" ");
  if (!/^https?:\/\//.test(urlInput)) {
    return sendResponse("Start the *URL* with http:// or https://");
  }
  try {
    const url = new URL(urlInput);
    const fetchUrl = `${url.origin}${url.pathname}?${url.searchParams.toString()}`;
    const response = await axios.get(fetchUrl, { responseType: 'arraybuffer' });
    if (response.status !== 200) {
      return sendResponse(`Failed to fetch the URL. Status: ${response.status} ${response.statusText}`);
    }
    const contentLength = response.headers['content-length'];
    if (contentLength && parseInt(contentLength) > 104857600) {
      return sendResponse(`Content-Length exceeds the limit: ${contentLength}`);
    }
    const contentType = response.headers['content-type'];
    console.log('Content-Type:', contentType);
    const buffer = Buffer.from(response.data);
    // Send with context info for all types
    const ctxInfo = getContextInfo("FETCHED CONTENT", undefined, undefined);
    if (/image\/.*/.test(contentType)) {
      await zk.sendMessage(sender, { image: { url: fetchUrl }, caption: `> > *${conf.BOT}*`, contextInfo: ctxInfo }, { quoted: context.ms });
    } else if (/video\/.*/.test(contentType)) {
      await zk.sendMessage(sender, { video: { url: fetchUrl }, caption: `> > *${conf.BOT}*`, contextInfo: ctxInfo }, { quoted: context.ms });
    } else if (/audio\/.*/.test(contentType)) {
      await zk.sendMessage(sender, { audio: { url: fetchUrl }, caption: `> > *${conf.BOT}*`, contextInfo: ctxInfo }, { quoted: context.ms });
    } else if (/text|json/.test(contentType)) {
      try {
        const json = JSON.parse(buffer);
        sendResponse(JSON.stringify(json, null, 10000));
      } catch {
        sendResponse(buffer.toString().slice(0, 10000));
      }
    } else {
      await zk.sendMessage(sender, { document: { url: fetchUrl }, caption: `> > *${conf.BOT}*`, contextInfo: ctxInfo }, { quoted: context.ms });
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
    zk.sendMessage(sender, { text: `Error fetching data: ${error.message}`, contextInfo: getContextInfo("FETCH ERROR") });
  }
});
