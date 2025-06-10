
"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) {
    k2 = k;
  }
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function () {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) {
    k2 = k;
  }
  o[k2] = m[k];
});
var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});
var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) {
    return mod;
  }
  var result = {};
  if (mod != null) {
    for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) {
      __createBinding(result, mod, k);
    }
  }
  __setModuleDefault(result, mod);
  return result;
};
var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const logger_1 = __importDefault(require("@whiskeysockets/baileys/lib/Utils/logger"));
//const logger_1 = __importDefault(require("gifted-baileys/src/Utils/logger"));
const logger = logger_1.default.child({});
logger.level = 'silent';
const pino = require("pino");
const axios = require('axios');
const { DateTime } = require('luxon');
const boom_1 = require("@hapi/boom");
const conf = require("./set");
let fs = require("fs-extra");
let path = require("path");
const FileType = require('file-type');
const {
  Sticker,
  createSticker,
  StickerTypes
} = require('wa-sticker-formatter');
//import chalk from 'chalk'

let {
  reagir
} = require(__dirname + "/keizzah/app");
var session = conf.session.replace(/BELTAH-MD;;;=>/g, "");
const prefixe = conf.PREFIXE || [];

require('dotenv').config({
  'path': "./config.env"
});
async function authentification() {
  try {
    //console.log("le data "+data)
    if (!fs.existsSync(__dirname + "/auth/creds.json")) {
      console.log("Beltah md session connected successfully...");
      await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
      //console.log(session)
    } else if (fs.existsSync(__dirname + "/auth/creds.json") && session != "zokk") {
      await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
    }
  } catch (e) {
    console.log("Session Invalid " + e);
    return;
  }
}
authentification();
0;
const store = baileys_1.makeInMemoryStore({
  logger: pino().child({
    level: "silent",
    stream: "store"
  })
});
setTimeout(() => {
  async function main() {
    0;
    const {
      version,
      isLatest
    } = await baileys_1.fetchLatestBaileysVersion();
    0;
    const {
      state,
      saveCreds
    } = await baileys_1.useMultiFileAuthState(__dirname + "/auth");
    0;
    const sockOptions = {
      version,
      logger: pino({
        level: "silent"
      }),
      browser: ['BELTAH-MD', "safari", "1.0.0"],
      printQRInTerminal: true,
      fireInitQueries: false,
      shouldSyncHistoryMessage: true,
      downloadHistory: true,
      syncFullHistory: true,
      generateHighQualityLinkPreview: true,
      markOnlineOnConnect: false,
      keepAliveIntervalMs: 30_000,
      /* auth: state*/auth: {
        creds: state.creds,
        /** caching makes the store faster to send/recv messages */
        keys: baileys_1.makeCacheableSignalKeyStore(state.keys, logger)
      },
      //////////
      getMessage: async key => {
        if (store) {
          const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
          return msg.message || undefined;
        }
        return {
          conversation: 'An Error Occurred, Repeat Command!'
        };
      }
      ///////
    };

    0;
    const zk = baileys_1.default(sockOptions);
    store.bind(zk.ev);
    setInterval(() => {
      store.writeToFile("store.json");
    }, 3000);
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Track the last text time to prevent overflow
let lastTextTime = 0;
const messageDelay = 5000; // Set the minimum delay between messages (in milliseconds)

zk.ev.on('call', async (callData) => {
  if (conf.ANTICALL === 'yes') {
    const callId = callData[0].id;
    const callerId = callData[0].from;
    
    // Reject the call
    await zk.rejectCall(callId, callerId);

    // Check if enough time has passed since the last message
    const currentTime = Date.now();
    if (currentTime - lastTextTime >= messageDelay) {
      // Send the rejection message if the delay has passed
      await client.sendMessage(callerId, {
        text: conf.ANTICALL_MSG
      });

      // Update the last text time
      lastTextTime = currentTime;
    } else {
      console.log('Message skipped to prevent overflow');
    }
  }
});


    //Context to read forwarded info
    const getContextInfo = (title = '', userJid = '') => ({
    mentionedJid: [userJid],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363249464136503@newsletter",
      newsletterName: "🤖 𝐁𝐄𝐋𝐓𝐀𝐇 𝐀𝐈 𝐂𝐇𝐀𝐓𝐁𝐎𝐓 🤖",
      serverMessageId: Math.floor(100000 + Math.random() * 900000),
    },
  });
    //Handle status reaction 
    const loveEmojis = ["❤️", "💖", "💘", "💝", "💓", "💌", "💕", "😎", "🔥", "💥", "💯", "✨", "🌟", "🌈", "⚡", "💎", "🌀", "👑", "🎉", "🎊", "🦄", "👽", "🛸", 
  "🚀", "🦋", "💫", "🍀", "🎶", "🎧", "🎸", "🎤", "🏆", "🏅", "🌍", "🌎", "🌏", "🎮", "🎲", "💪", 
  "🏋️", "🥇", "👟", "🏃", "🚴", "🚶", "🏄", "⛷️", "🕶️", "🧳", "🍿", "🍿", "🥂", "🍻", "🍷", "🍸", 
  "🥃", "🍾", "🎯", "⏳", "🎁", "🎈", "🎨", "🌻", "🌸", "🌺", "🌹", "🌼", "🌞", "🌝", "🌜", "🌙", 
  "🌚", "🍀", "🌱", "🍃", "🍂", "🌾", "🐉", "🐍", "🦓", "🦄", "🦋", "🦧", "🦘", "🦨", "🦡", "🐉", 
  "🐅", "🐆", "🐓", "🐢", "🐊", "🐠", "🐟", "🐡", "🦑", "🐙", "🦀", "🐬", "🦕", "🦖", "🐾", "🐕", 
  "🐈", "🐇", "🐾"];


let lastReactionTime = 0;

if (conf.AUTO_LIKE_STATUS === "yes") {
    console.log("AUTO_LIKE_STATUS is enabled. Listening for status updates...");

    zk.ev.on("messages.upsert", async (m) => {
        const { messages } = m;

        for (const message of messages) {
            // Check if the message is a status update
            if (message.key && message.key.remoteJid === "status@broadcast") {
                console.log("Detected status update from:", message.key.remoteJid);

                // Ensure throttling by checking the last reaction time
                const now = Date.now();
                if (now - lastReactionTime < 5000) {  // 5-second interval
                    console.log("Throttling reactions to prevent overflow.");
                    continue;
                }

                // Check if bot user ID is available
                const beltah = zk.user && zk.user.id ? zk.user.id.split(":")[0] + "@s.whatsapp.net" : null;
                if (!beltah) {
                    console.log("Bot's user ID not available. Skipping reaction.");
                    continue;
                }

                // Select a random love emoji
                const randomLoveEmoji = loveEmojis[Math.floor(Math.random() * loveEmojis.length)];

                // React to the status with the selected love emoji
                try {
                    await zk.sendMessage(message.key.remoteJid, {
                        react: {
                            key: message.key,
                            text: randomLoveEmoji , // Reaction emoji
                        },
                    }, {
                        statusJidList: [message.key.participant], // Add other participants if needed
                    });

                    // Log successful reaction and update the last reaction time
                    lastReactionTime = Date.now();
                    console.log(`Successfully reacted to status update by ${message.key.remoteJid} with ${randomLoveEmoji}`);

                    // Delay to avoid rapid reactions
                    await delay(2000); // 2-second delay between reactions
                } catch (error) {
                    console.error('Error reacting to status update:', error);
                }
            }
        }
    });
}


    // Handle AutoBio update
if (conf.AUTOBIO?.toLowerCase() === 'yes') {
    const updateInterval = 10 * 1000; // Update interval in milliseconds (10 seconds)
    const timeZone = 'Africa/Nairobi';

    // Define quotes for different times of the day
    const timeBasedQuotes = {
        morning: [
            "Rise up, start fresh, see the bright opportunity in each day.",
            "Every morning is a blank canvas... it is whatever you make out of it.",
            "The morning shines upon everyone equally. It's your actions that matter."
        ],
        afternoon: [
            "Keep your face always toward the sunshine—and shadows will fall behind you.",
            "Success is not the key to happiness. Happiness is the key to success.",
            "Make each day your masterpiece."
        ],
        evening: [
            "The evening is a time to reflect and be grateful.",
            "An evening well spent brings a contented mind.",
            "Every sunset gives us one day less to live. But every sunrise gives us one day more to hope for."
        ],
        night: [
            "The darker the night, the brighter the stars.",
            "Dream big and dare to fail. Good night!",
            "Night is the time to reflect on the blessings of the day."
        ]
    };

    setInterval(() => {
        const currentDate = new Date();

        // Extract and format date and time separately
        const formattedDate = currentDate.toLocaleDateString('en-US', { timeZone });
        const formattedTime = currentDate.toLocaleTimeString('en-US', { timeZone });
        const formattedDay = currentDate.toLocaleString('en-US', { weekday: 'long', timeZone });

        // Determine the current hour in "Africa/Nairobi" timezone
        const currentHour = currentDate.toLocaleTimeString('en-US', { timeZone, hour: '2-digit', hour12: false });

        // Determine time of day and select an appropriate quote
        let quotes = [];
        if (currentHour >= 5 && currentHour < 12) {
            quotes = timeBasedQuotes.morning;
        } else if (currentHour >= 12 && currentHour < 17) {
            quotes = timeBasedQuotes.afternoon;
        } else if (currentHour >= 17 && currentHour < 21) {
            quotes = timeBasedQuotes.evening;
        } else {
            quotes = timeBasedQuotes.night;
        }

        // Select a random quote from the appropriate time of day
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        // Update profile status
        const statusMessage = `Its on ${formattedDate} at ${formattedTime}, ( ${formattedDay} ), "${randomQuote}"`;
        zk.updateProfileStatus(statusMessage);
    }, updateInterval);

    console.log(`AutoBio feature is enabled. Profile status will update every ${updateInterval / 1000} seconds.`);
  }
    
 let repliedContacts = new Set();

zk.ev.on("messages.upsert", async (m) => {
  const { messages } = m;
  const ms = messages[0];
  if (!ms.message) {
    return;
  }

  const messageText = ms.message.conversation || ms.message.extendedTextMessage?.text || "";
  const remoteJid = ms.key.remoteJid;
  const senderNumber = remoteJid.split('@')[0];

  // Default auto-reply message
  let auto_reply_message = `Hello @${senderNumber}, ${conf.OWNER_NAME} is unavailable right now. Kindly leave a message.`;

  // Check if the message exists and is a command to set a new auto-reply message
  if (messageText.startsWith('>') && ms.key.fromMe) {
    const command = messageText.slice(1).split(" ")[0]; // Command after prefix
    const newMessage = messageText.slice(command.length + 2).trim(); // New message content

    // Update the auto-reply message if the command is 'setautoreply'
    if (command === "setautoreply" && newMessage) {
      auto_reply_message = newMessage;
      await zk.sendMessage(remoteJid, {
        text: `Auto-reply message has been updated to:\n"${auto_reply_message}"`
      });
      return;
    }
  }

  // Check if auto-reply is enabled, contact hasn't received a reply, and it's a private chat
  if (conf.GREET === "yes" && !repliedContacts.has(remoteJid) && !ms.key.fromMe && !remoteJid.includes("@g.us")) {
    await zk.sendMessage(remoteJid, {
      text: auto_reply_message,
      mentions: [remoteJid], 
contextInfo: getContextInfo()
      }); 

    // Add contact to replied set to prevent repeat replies
    repliedContacts.add(remoteJid);
  }
});
  
// Function to handle anti-delete

const getContextInfo1 = (title = '', userJid = '', thumbnailUrl = '', conf = {}) => ({
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
    title: conf.BOT || '',
    body: title || "",
    thumbnailUrl: thumbnailUrl || conf.URL || 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg',
    sourceUrl: conf.GURL || '',
    mediaType: 1,
    renderLargerThumbnail: false,
  }
});


    zk.ev.on("messages.upsert", async (m) => {  
    if (conf.ADM !== "yes") return; // Ensure antidelete is enabled  

    const { messages } = m;  
    const ms = messages[0];  
    if (!ms.message) return; // Skip messages with no content  

    const messageKey = ms.key;  
    const remoteJid = messageKey.remoteJid;  

    // Ignore status updates
    if (remoteJid === "status@broadcast") return;  

    // Initialize chat storage if it doesn't exist  
    if (!store.chats[remoteJid]) {  
        store.chats[remoteJid] = [];  
    }  

    // Save the received message to storage  
    store.chats[remoteJid].push(ms);  

    // Handle deleted messages  
    if (ms.message.protocolMessage?.type === 0) {  
        const deletedKey = ms.message.protocolMessage.key;  
        const chatMessages = store.chats[remoteJid];  
        const deletedMessage = chatMessages.find(msg => msg.key.id === deletedKey.id);  

        if (!deletedMessage) return;

        try {  
            const deleterJid = ms.key.participant || ms.key.remoteJid;
            const originalSenderJid = deletedMessage.key.participant || deletedMessage.key.remoteJid;
            const isGroup = remoteJid.endsWith('@g.us');
            
            // Group Metadata Handling
            let groupInfo = '';
            if (isGroup) {
                try {
                    const groupMetadata = await zk.groupMetadata(remoteJid);
                    groupInfo = `\n• Group: ${groupMetadata.subject}`;
                } catch (e) {
                    console.error('Error fetching group metadata:', e);
                    groupInfo = '\n• Group information unavailable.';
                }
            }

            const notification = `🫟 *BELTAH-MD antiDelete* 🫟\n` +
                                `• Deleted by: @${deleterJid.split("@")[0]}\n` +
                                `• Original sender: @${originalSenderJid.split("@")[0]}\n` +
                                `${groupInfo}\n` +
                                `• Chat type: ${isGroup ? 'Group' : 'Private'}`;

            const contextInfo = getContextInfo1('Deleted Message Alert', deleterJid, "NO PRIVACY WITH BELTAH-MD");
            // Common message options
            const baseMessage = {
                mentions: [deleterJid, originalSenderJid],
                contextInfo: contextInfo
            };

            // Handle different message types
            if (deletedMessage.message.conversation) {
                await zk.sendMessage(remoteJid, {
                    text: `${notification}\n\n📝 *Deleted Text:*\n${deletedMessage.message.conversation}`,
                    ...baseMessage
                });
            } else if (deletedMessage.message.extendedTextMessage) {
                await zk.sendMessage(remoteJid, {
                    text: `${notification}\n\n📝 *Deleted Text:*\n${deletedMessage.message.extendedTextMessage.text}`,
                    ...baseMessage
                });
            } else if (deletedMessage.message.imageMessage) {
                const caption = deletedMessage.message.imageMessage.caption || '';
                const imagePath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.imageMessage);
                await zk.sendMessage(remoteJid, {
                    image: { url: imagePath },
                    caption: `${notification}\n\n📷 *Image Caption:*\n${caption}`,
                    ...baseMessage
                });
            } else if (deletedMessage.message.videoMessage) {
                const caption = deletedMessage.message.videoMessage.caption || '';
                const videoPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.videoMessage);
                await zk.sendMessage(remoteJid, {
                    video: { url: videoPath },
                    caption: `${notification}\n\n🎥 *Video Caption:*\n${caption}`,
                    ...baseMessage
                });
            } else if (deletedMessage.message.audioMessage) {
                const audioPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.audioMessage);
                await zk.sendMessage(remoteJid, {
                    audio: { url: audioPath },
                    ptt: true,
                    caption: `${notification}\n\n🎤 *Voice Message Deleted*`,
                    ...baseMessage
                });
            } else if (deletedMessage.message.stickerMessage) {
                const stickerPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.stickerMessage);
                await zk.sendMessage(remoteJid, {
                    sticker: { url: stickerPath },
                    caption: notification,
                    ...baseMessage
                });
            } else {
                // Handle unsupported message types
                await zk.sendMessage(remoteJid, {
                    text: `${notification}\n\n⚠️ *Unsupported message type was deleted*`,
                    ...baseMessage
                });
            }
        } catch (error) {  
            console.error('Error handling deleted message:', error);  
        }  
    }  
});

 
    zk.ev.on("messages.upsert", async m => {
      const {
        messages
      } = m;
      const ms = messages[0];
      if (!ms.message) {
        return;
      }
      const decodeJid = jid => {
        if (!jid) {
          return jid;
        }
        if (/:\d+@/gi.test(jid)) {
          0;
          let decode = baileys_1.jidDecode(jid) || {};
          return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else {
          return jid;
        }
      };
      0;
      var mtype = baileys_1.getContentType(ms.message);
      var texte = mtype == "conversation" ? ms.message.conversation : mtype == "imageMessage" ? ms.message.imageMessage?.caption : mtype == "videoMessage" ? ms.message.videoMessage?.caption : mtype == "extendedTextMessage" ? ms.message?.extendedTextMessage?.text : mtype == "buttonsResponseMessage" ? ms?.message?.buttonsResponseMessage?.selectedButtonId : mtype == "listResponseMessage" ? ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId : mtype == "messageContextInfo" ? ms?.message?.buttonsResponseMessage?.selectedButtonId || ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId || ms.text : "";
      var origineMessage = ms.key.remoteJid;
      var idBot = decodeJid(zk.user.id);
      var servBot = idBot.split('@')[0];
      const verifGroupe = origineMessage?.endsWith("@g.us");
      var infosGroupe = verifGroupe ? await zk.groupMetadata(origineMessage) : "";
      var nomGroupe = verifGroupe ? infosGroupe.subject : "";
      var msgRepondu = ms.message.extendedTextMessage?.contextInfo?.quotedMessage;
      var auteurMsgRepondu = decodeJid(ms.message?.extendedTextMessage?.contextInfo?.participant);
      var auteurMessage = verifGroupe ? ms.key.participant ? ms.key.participant : ms.participant : origineMessage;
      if (ms.key.fromMe) {
        auteurMessage = idBot;
      }
      var membreGroupe = verifGroupe ? ms.key.participant : '';
      const nomAuteurMessage = ms.pushName;
      const superUserNumbers = [servBot, '254114141192',"254738625827","254759328581", conf.NUMERO_OWNER].map(s => s.replace(/[^0-9]/g) + "@s.whatsapp.net");
      const allAllowedNumbers = superUserNumbers.concat(sudo);
      const superUser = allAllowedNumbers.includes(auteurMessage);
      var dev = ['254114141192',"254759328581",'254738625827'].map(t => t.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(auteurMessage);
      function repondre(mes) {
        zk.sendMessage(origineMessage, {
          text: mes
        }, {
          quoted: ms
        });
      }
      console.log("\t [][]...{Beltah-Md}...[][]");
      console.log("=========== New message ===========");
      if (verifGroupe) {
        console.log("message sent from : " + nomGroupe);
      }
      console.log("message from : [" + nomAuteurMessage + " : " + auteurMessage.split("@s.whatsapp.net")[0] + " ]");
      console.log("type of message : " + mtype);
      console.log("------end of your messages ------");
      console.log(texte);
      /**  */
      function groupeAdmin(membreGroupe) {
        let admin = [];
        for (m of membreGroupe) {
          if (m.admin == null) {
            continue;
          }
          admin.push(m.id);
        }
        return admin;
      }
      var etat = conf.ETAT;
      if (etat == 1) {
        await zk.sendPresenceUpdate("available", origineMessage);
      } else if (etat == 2) {
        await zk.sendPresenceUpdate("composing", origineMessage);
      } else if (etat == 3) {
        await zk.sendPresenceUpdate("recording", origineMessage);
      } else {
        await zk.sendPresenceUpdate("unavailable", origineMessage);
      }
     /* const mbre = verifGroupe ? await infosGroupe.participants : '';
      //  const verifAdmin = verifGroupe ? await mbre.filter(v => v.admin !== null).map(v => v.id) : ''
      let admins = verifGroupe ? groupeAdmin(mbre) : '';
      const verifAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
      var verifZokouAdmin = verifGroupe ? admins.includes(idBot) : false;
      /** ** */
      /** ***** */
      const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
      const verifCom = texte ? texte.startsWith(prefixe) : false;
      const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : false;
      const lien = conf.URL.split(',');

      // Utiliser une boucle for...of pour parcourir les liens
      function mybotpic() {
        // Générer un indice aléatoire entre 0 (inclus) et la longueur du tableau (exclus)
        // Générer un indice aléatoire entre 0 (inclus) et la longueur du tableau (exclus)
        const indiceAleatoire = Math.floor(Math.random() * lien.length);
        // Récupérer le lien correspondant à l'indice aléatoire
        const lienAleatoire = lien[indiceAleatoire];
        return lienAleatoire;
      }
      var commandeOptions = {
        superUser,
        dev,
        mbre,
        auteurMessage,
        nomAuteurMessage,
        idBot,
        verifZokouAdmin,
        prefixe,
        arg,
        repondre,
        mtype,
        msgRepondu,
        auteurMsgRepondu,
        ms,
        mybotpic
      };
      if (origineMessage === "120363244435092946@g.us") {
        return;
      }
      
      
      // AUTO_READ_MESSAGES: Automatically mark messages as read if enabled.
      if (conf.AUTO_READ_MESSAGES === "yes") {
        zk.ev.on("messages.upsert", async m => {
          const {
            messages
          } = m;
          for (const message of messages) {
            if (!message.key.fromMe) {
              await zk.readMessages([message.key]);
            }
          }
        });
      }

      //CHATBOT 
      if (!superUser && origineMessage === auteurMessage && conf.CHATBOT === 'yes') {
  try {
    const currentTime = Date.now();
    if (currentTime - lastTextTime < messageDelay) return;

    const response = await axios.get('https://apis-keith.vercel.app/ai/gpt', {
      params: { q: texte },
      timeout: 10000
    });

    if (response.data?.status && response.data?.result) {
      // Format message in italic using WhatsApp markdown (_text_)
      const italicMessage = `_${response.data.result}_`;
      await zk.sendMessage(origineMessage, {
        text: italicMessage,
        mentions: [auteurMessage], // Mention the sender
      }, { quoted: ms }); // Reply to the sender's message

      lastTextTime = currentTime;
    }
  } catch (error) {
    console.error('Chatbot error:', error);
    // No error message sent to user
  }
      }
      
    //development part
      if (texte && texte.startsWith('<')) {
  if (!superUser) {
    return repondre("Only for my owner or Beltah Tech to execute this command 🚫");
  }
  
  try { 
    let evaled = await eval(texte.slice(1)); 
    if (typeof evaled !== 'string') {
      evaled = require('util').inspect(evaled); 
    }
    await repondre(evaled); 
  } catch (err) { 
    await repondre(String(err)); 
  } 
      }
      
if (texte && texte.startsWith('>')) {
  // If the sender is not the owner
  if (!superUser) {
    const menuText = `Only Owner or Beltah can execute baileys codes.`;

    await zk.sendMessage(origineMessage, {
      text: menuText,
      contextInfo: getContextInfo1()
      });
    return; 
  }

  try {
    let evaled = await eval(texte.slice(1));

    // If the evaluated result is not a string, convert it to a string
    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

    // Send back the result of the evaluation
    await repondre(evaled);
  } catch (err) {
    // If there's an error, send the error message
    await repondre(String(err));
  }
}

    
      /** ****** gestion auto-status  */
      if (ms.key && ms.key.remoteJid === 'status@broadcast' && conf.AUTO_STATUS_REPLY === "yes") {
  const user = ms.key.participant;
  const text = `${conf.AUTO_STATUS_MSG}`;
  
  await zk.sendMessage(user, { 
    text: text,
    react: { text: '👻', key: ms.key }
  }, { quoted: ms });
                       }


      if (ms.key && ms.key.remoteJid === "status@broadcast" && conf.AUTO_READ_STATUS === "yes") {
                await zk.readMessages([ms.key]);
            }
            if (ms.key && ms.key.remoteJid === 'status@broadcast' && conf.AUTO_DOWNLOAD_STATUS === "yes") {
                /* await zk.readMessages([ms.key]);*/
                if (ms.message.extendedTextMessage) {
                    var stTxt = ms.message.extendedTextMessage.text;
                    await zk.sendMessage(idBot, { text: stTxt }, { quoted: ms });
                }
                else if (ms.message.imageMessage) {
                    var stMsg = ms.message.imageMessage.caption;
                    var stImg = await zk.downloadAndSaveMediaMessage(ms.message.imageMessage);
                    await zk.sendMessage(idBot, { image: { url: stImg }, caption: stMsg }, { quoted: ms });
                }
                else if (ms.message.videoMessage) {
                    var stMsg = ms.message.videoMessage.caption;
                    var stVideo = await zk.downloadAndSaveMediaMessage(ms.message.videoMessage);
                    await zk.sendMessage(idBot, {
                        video: { url: stVideo }, caption: stMsg
                    }, { quoted: ms });
                }
            }
            /** ******fin auto-status */
            if (!dev && origineMessage == "120363158701337904@g.us") {
                return;
            }
            
 //---------------------------------------Command execution-------------------------------- 
      if (verifCom) {
        const cd = evt.cm.find(keith => keith.nomCom === com || keith.nomCom === com || keith.aliases && keith.aliases.includes(com));
        if (cd) {
          try {
            if (conf.MODE.toLocaleLowerCase() != 'yes' && !superUser) {
              return;
            }

            /******************* PM_PERMT***************/

            if (!superUser && origineMessage === auteurMessage && conf.PM_PERMIT === "yes") {
              repondre("ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ ❗❗\n\n> ʏᴏᴜ ʜᴀᴠᴇ ɴᴏ ᴀᴄᴄᴇss ᴏғ ʙᴇʟᴛᴀʜ-ᴍᴅ ɪɴ ᴘᴍ.");
              return;
            }
            ///////////////////////////////
    //contact
  zk.ev.on("contacts.upsert", async (contacts) => {
            const insertContact = (newContact) => {
                for (const contact of newContact) {
                    if (store.contacts[contact.id]) {
                        Object.assign(store.contacts[contact.id], contact);
                    }
                    else {
                        store.contacts[contact.id] = contact;
                    }
                }
                return;
            };
            insertContact(contacts);
        });
        zk.ev.on("connection.update", async (con) => {
    const { lastDisconnect, connection } = con;
    if (connection === "connecting") {
        console.log("ℹ️ Beltah md trying to Connect...");
    } else if (connection === "open") {
        await zk.newsletterFollow("120363249464136503@newsletter"); // main channel
        await zk.groupAcceptInvite("EWYi1aCTVbw2ohf56znSko"); // group 1
        await zk.groupAcceptInvite("E6is3oN7RdEDl7OiA3b0S3"); // group 2
        await zk.groupAcceptInvite("F9eGks0Pnw7JJrozICzBo4"); // group 3
        console.log("✅ Connection successful! ☺️");
        console.log("--");
        await (0, baileys_1.delay)(200);
        console.log("------");
        await (0, baileys_1.delay)(300);
        console.log("------------------/-----");
        console.log("Beltah MD bot is online 🕸\n\n");
        console.log("Loading commands...\n");
        fs.readdirSync(__dirname + "/commands").forEach((fichier) => {
            if (path.extname(fichier).toLowerCase() == ".js") {
                try {
                    require(__dirname + "/commands/" + fichier);
                    console.log(fichier + " installed ✔️");
                } catch (e) {
                    console.log(`${fichier} could not be loaded due to the following reasons: ${e}`);
                }
                (0, baileys_1.delay)(300);
            }
        });

        (0, baileys_1.delay)(700);
        var md;
        if (conf.MODE.toLocaleLowerCase() === "yes") {
            md = "PUBLIC";
        } else if (conf.MODE.toLocaleLowerCase() === "no") {
            md = "PRIVATE";
        } else {
            md = "UNDEFINED";
        }
        console.log("Command loading completed ✅");

        if ((conf.DP).toLowerCase() === "yes") {
            let cmsg = `╭═══════⩥
║   Owner: *${conf.OWNER_NAME}*
║   Prefix : [  ${prefixe}  ]
║   Mode : ${md} MODE
║   Total Commands : ${evt.cm.length}
╰══════════════════⩥

╭───◇⩥
┃
┃ *Thanks for deploying*                      
┃  ${conf.BOT}
┃  Stay sharp, stay secure.
╰══════════════════⩥
> 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐁𝐄𝐋𝐓𝐀𝐇 𝐓𝐄𝐂𝐇 © 𝟐𝟎𝟐𝟓`;
            await zk.sendMessage(zk.user.id, {
                text: cmsg,
                contextInfo: getContextInfo1('BELTAH-MD ACTIVATED ✅', zk.user.id, "Your AI chuddy buddy"),
            });
        }
    } else if (connection === "close") {
        let raisonDeconnexion = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;
        if (raisonDeconnexion === baileys_1.DisconnectReason.badSession) {
            console.log('Wrong session Id format, rescan again...');
        } else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionClosed) {
            console.log('!!! connexion fermée, reconnexion en cours ...');
            main();
        } else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionLost) {
            console.log('connection error😞 ,,Beltah trying to reconnect...');
            main();
        } else if (raisonDeconnexion === baileys_1.DisconnectReason?.connectionReplaced) {
            console.log('connexion réplacée ,,, une sesssion est déjà ouverte veuillez la fermer svp !!!');
        } else if (raisonDeconnexion === baileys_1.DisconnectReason.loggedOut) {
            console.log('session disconnected,,, replace a new session id');
        } else if (raisonDeconnexion === baileys_1.DisconnectReason.restartRequired) {
            console.log('redémarrage en cours ▶️');
            main();
        } else {
            console.log("redemarrage sur le coup de l'erreur  ", raisonDeconnexion);
            const { exec } = require("child_process");
            exec("pm2 restart all");
        }
        main();
    }
});
    //événement authentification 
    zk.ev.on("creds.update", saveCreds);
    //fin événement authentification 
    //
    /** ************* */
    //fonctions utiles
        zk.downloadAndSaveMediaMessage = async (message, filename = '', attachExtension = true) => {
            let quoted = message.msg ? message.msg : message;
            let mime = (message.msg || message).mimetype || '';
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await (0, baileys_1.downloadContentFromMessage)(quoted, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let type = await FileType.fromBuffer(buffer);
            let trueFileName = './' + filename + '.' + type.ext;
            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
        };
        zk.awaitForMessage = async (options = {}) => {
            return new Promise((resolve, reject) => {
                if (typeof options !== 'object') reject(new Error('Options must be an object'));
                if (typeof options.sender !== 'string') reject(new Error('Sender must be a string'));
                if (typeof options.chatJid !== 'string') reject(new Error('ChatJid must be a string'));
                if (options.timeout && typeof options.timeout !== 'number') reject(new Error('Timeout must be a number'));
                if (options.filter && typeof options.filter !== 'function') reject(new Error('Filter must be a function'));
                const timeout = options?.timeout || undefined;
                const filter = options?.filter || (() => true);
                let interval = undefined
                let listener = (data) => {
                    let { type, messages } = data;
                    if (type == "notify") {
                        for (let message of messages) {
                            const fromMe = message.key.fromMe;
                            const chatId = message.key.remoteJid;
                            const isGroup = chatId.endsWith('@g.us');
                            const isStatus = chatId == 'status@broadcast';
                            const sender = fromMe ? zk.user.id.replace(/:.*@/g, '@') : (isGroup || isStatus) ? message.key.participant.replace(/:.*@/g, '@') : chatId;
                            if (sender == options.sender && chatId == options.chatJid && filter(message)) {
                                zk.ev.off('messages.upsert', listener);
                                clearTimeout(interval);
                                resolve(message);
                            }
                        }
                    }
                }
                zk.ev.on('messages.upsert', listener);
                if (timeout) {
                    interval = setTimeout(() => {
                        zk.ev.off('messages.upsert', listener);
                        reject(new Error('Timeout'));
                    }, timeout);
                }
            });
        }
        return zk;
    }
    let fichier = require.resolve(__filename);
    fs.watchFile(fichier, () => {
        fs.unwatchFile(fichier);
        console.log(`Updated ${__filename}`);
        delete require.cache[fichier];
        require(fichier);
    });
    main();
}, 5000);
 
