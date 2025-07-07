const { keith } = require('../keizzah/keith');
const Heroku = require('heroku-client');
const s = require("../set");
const axios = require("axios");
const { exec } = require("child_process");
const conf = require(__dirname + "/../set");

// Forwarded context info generator (single, consistent format)
function getForwardedContextInfo(title = conf.BOT, userJid = conf.OWNER_NUMBER, thumbnailUrl = conf.URL) {
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
        body: conf.OWNER_NAME,
        thumbnailUrl,
        sourceUrl: conf.GURL || '',
      },
    };
  } catch (error) {
    console.error(`Error in getForwardedContextInfo: ${error.message}`);
    return {};
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

// Loading animation with progress bar
async function loading(dest, zk) {
  const lod = [
    "⬛⬛⬜⬜⬜⬜⬛⬛20%",
    "⬛⬛⬛⬛⬜⬜⬜⬜40%",
    "⬜⬜⬛⬛⬛⬛⬜⬜60%",
    "⬜⬜⬜⬜⬛⬛⬛⬛80%",
    "⬛⬛⬜⬜⬜⬜⬛⬛100%",
    "*Pinging response✅*"
  ];
  let { key } = await zk.sendMessage(dest, { text: 'Loading Please Wait' });
  for (let i = 0; i < lod.length; i++) {
    await zk.sendMessage(dest, { text: lod[i], edit: key });
    await delay(500);
  }
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
  const audioMessage = {
    audio: { url: selectedAudio },
    mimetype: 'audio/mpeg',
    ptt: true,
    waveform: [100, 0, 100, 0, 100, 0, 100],
    fileName: 'shizo',
    contextInfo: getForwardedContextInfo('🟢 BELTAH-MD ONLINE 🟢'),
  };
  await zk.sendMessage(dest, audioMessage, { quoted: ms });
});

// Command: restart/reboot
keith({
  nomCom: 'restart',
  aliases: ['reboot'],
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;
  if (!superUser) return repondre("You need owner privileges to execute this command!");
  try {
    await repondre("*Restarting...*");
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
  const { repondre, superUser } = context;
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
    zk.sendMessage(chatId, {
      text: str,
      contextInfo: getForwardedContextInfo('Heroku Vars'),
    });
  } catch (error) {
    console.error('Error fetching Heroku config vars:', error);
    zk.sendMessage(chatId, {
      text: 'Sorry, there was an error fetching the config vars.',
      contextInfo: getForwardedContextInfo('Heroku Vars'),
    });
  }
});

// Command: setvar (set Heroku config var)
keith({
  nomCom: 'setvar',
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser, arg } = context;
  if (!superUser) return repondre("*This command is restricted to the bot owner or Alpha owner 💀*");
  const appname = s.HEROKU_APP_NAME;
  const herokuapi = s.HEROKU_API_KEY;
  if (!arg || arg.length !== 1 || !arg[0].includes('=')) {
    return repondre('Incorrect Usage:\nProvide the key and value correctly.\nExample: setvar ANTICALL=yes');
  }
  const [key, value] = arg[0].split('=');
  const heroku = new Heroku({ token: herokuapi });
  const baseURI = `/apps/${appname}/config-vars`;
  try {
    await heroku.patch(baseURI, { body: { [key]: value } });
    await zk.sendMessage(chatId, {
      text: `*✅ The variable ${key} = ${value} has been set successfully. The bot is restarting...*`,
      contextInfo: getForwardedContextInfo('Heroku Var Set'),
    });
  } catch (error) {
    console.error('Error setting config variable:', error);
    await zk.sendMessage(chatId, {
      text: `❌ There was an error setting the variable. Please try again later.\n${error.message}`,
      contextInfo: getForwardedContextInfo('Heroku Var Set'),
    });
  }
});

// Command: shell/getcmd/cmd
keith({
  nomCom: "shell",
  aliases: ["getcmd", "cmd"],
  reaction: '🗿',
  categorie: "coding"
}, async (context, message, params) => {
  const { repondre: sendResponse, arg: commandArgs, superUser: Owner } = params;
  if (!Owner) return sendResponse("You are not authorized to execute shell commands.");
  const command = commandArgs.join(" ").trim();
  if (!command) return sendResponse("Please provide a valid shell command.");
  exec(command, (err, stdout, stderr) => {
    const contextInfo = getForwardedContextInfo('Shell Output');
    if (err) return message.sendMessage(context, { text: `Error: ${err.message}`, contextInfo });
    if (stderr) return message.sendMessage(context, { text: `stderr: ${stderr}`, contextInfo });
    if (stdout) return message.sendMessage(context, { text: stdout, contextInfo });
    return message.sendMessage(context, { text: "Command executed successfully, but no output was returned.", contextInfo });
  });
});

// Command: ping/speed/latency
keith({
  nomCom: 'ping',
  aliases: ['speed', 'latency'],
  desc: 'To check bot response time',
  categorie: 'system',
  reaction: '✅',
  fromMe: true,
}, async (dest, zk) => {
  const loadingPromise = loading(dest, zk);
  const pingResults = Array.from({ length: 1 }, () => Math.floor(Math.random() * 10000 + 1000));
  const formattedResults = pingResults.map(ping => `${conf.BOT} SPEED || ${ping} ms `);
  await zk.sendMessage(dest, {
    text: `*${formattedResults.join(', ')}*`,
    contextInfo: getForwardedContextInfo('Ping Results'),
  });
  await loadingPromise;
});

// Command: uptime/runtime/running
keith({
  nomCom: 'uptime',
  aliases: ['runtime', 'running'],
  desc: 'To check runtime',
  categorie: 'system',
  reaction: '🫆',
  fromMe: true,
}, async (dest, zk, commandeOptions) => {
  const botUptime = process.uptime();
  await zk.sendMessage(dest, {
    text: `*${conf.BOT} UPTIME || ${runtime(botUptime)}*`,
    contextInfo: getForwardedContextInfo('Uptime'),
  });
});

// Command: update/redeploy/sync
keith({
  nomCom: 'update',
  aliases: ['redeploy', 'sync'],
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;
  if (!superUser) return repondre("*This command is restricted to the bot owner*");
  const herokuAppName = s.HEROKU_APP_NAME;
  const herokuApiKey = s.HEROKU_API_KEY;
  if (!herokuAppName || !herokuApiKey) {
    return zk.sendMessage(chatId, {
      text: "Please make sure you have set the `HEROKU_APP_NAME` and `HEROKU_API_KEY` environment variables.",
      contextInfo: getForwardedContextInfo('Update Error'),
    });
  }
  async function redeployApp() {
    try {
      const response = await axios.post(
        `https://api.heroku.com/apps/${herokuAppName}/builds`,
        {
          source_blob: {
            url: "https://github.com/Beltahinfo/Beltah-xmd/tarball/main",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${herokuApiKey}`,
            Accept: "application/vnd.heroku+json; version=3",
          },
        }
      );
      await zk.sendMessage(chatId, {
        text: "*Your bot is getting updated.*",
        contextInfo: getForwardedContextInfo('🟢 BELTAH-MD UPDATING 🟢'),
      });
    } catch (error) {
      const errorMessage = error.response?.data || error.message;
      await zk.sendMessage(chatId, {
        text: `*Failed to update and redeploy. ${errorMessage} Please check if you have set the Heroku API key and Heroku app name correctly.*`,
        contextInfo: getForwardedContextInfo('Updating Error!!! '),
      });
    }
  }
  redeployApp();
});

// Command: fetch/get/find
keith({
  nomCom: "fetch",
  aliases: ["get", "find"],
  categorie: "coding",
  reaction: '🛄',
}, async (sender, zk, context) => {
  const { repondre: sendResponse, arg: args } = context;
  const urlInput = args.join(" ");
  if (!/^https?:\/\//.test(urlInput)) {
    return sendResponse("Start the *URL* with http:// or https://");
  }
  try {
    const url = new URL(urlInput);
    const fetchUrl = `${url.origin}${url.pathname}?${url.searchParams.toString()}`;
    const response = await axios.get(fetchUrl, { responseType: 'arraybuffer' });
    if (response.status !== 200) {
      return zk.sendMessage(sender, {
        text: `Failed to fetch the URL. Status: ${response.status} ${response.statusText}`,
        contextInfo: getForwardedContextInfo('Fetch Error'),
      });
    }
    const contentLength = response.headers['content-length'];
    if (contentLength && parseInt(contentLength) > 104857600) {
      return zk.sendMessage(sender, {
        text: `Content-Length exceeds the limit: ${contentLength}`,
        contextInfo: getForwardedContextInfo('Fetch Error'),
      });
    }
    const contentType = response.headers['content-type'];
    const buffer = Buffer.from(response.data);
    const commonMsgOptions = { quoted: context.ms, contextInfo: getForwardedContextInfo('Fetch Result') };
    if (/image\/.*/.test(contentType)) {
      await zk.sendMessage(sender, { image: { url: fetchUrl }, caption: `> > *${conf.BOT}*` }, commonMsgOptions);
    } else if (/video\/.*/.test(contentType)) {
      await zk.sendMessage(sender, { video: { url: fetchUrl }, caption: `> > *${conf.BOT}*` }, commonMsgOptions);
    } else if (/audio\/.*/.test(contentType)) {
      await zk.sendMessage(sender, { audio: { url: fetchUrl }, caption: `> > *${conf.BOT}*` }, commonMsgOptions);
    } else if (/text|json/.test(contentType)) {
      try {
        const json = JSON.parse(buffer);
        await zk.sendMessage(sender, { text: JSON.stringify(json, null, 2).slice(0, 10000) }, { contextInfo: getForwardedContextInfo('Fetch Result') });
      } catch {
        await zk.sendMessage(sender, { text: buffer.toString().slice(0, 10000) }, { contextInfo: getForwardedContextInfo('Fetch Result') });
      }
    } else {
      await zk.sendMessage(sender, { document: { url: fetchUrl }, caption: `> > *${conf.BOT}*` }, commonMsgOptions);
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
    await zk.sendMessage(sender, {
      text: `Error fetching data: ${error.message}`,
      contextInfo: getForwardedContextInfo('Fetch Error'),
    });
  }
});
