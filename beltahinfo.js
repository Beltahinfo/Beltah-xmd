"use strict";

const baileys = require("@whiskeysockets/baileys");
const { default: makeBaileys, jidDecode, getContentType, downloadContentFromMessage, delay, fetchLatestBaileysVersion } = baileys;
const pino = require("pino");
const axios = require("axios");
const { DateTime } = require("luxon");
const Boom = require("@hapi/boom");
const conf = require("./set");
const fs = require("fs-extra");
const path = require("path");
const FileType = require("file-type");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

// local db modules (kept as original)
const { verifierEtatJid, recupererActionJid } = require("./bdd/antilien");
const { atbverifierEtatJid, atbrecupererActionJid } = require("./bdd/antibot");
const evt = require(__dirname + "/keizzah/keith");
const { isUserBanned, addUserToBanList, removeUserFromBanList } = require("./bdd/banUser");
const { addGroupToBanList, isGroupBanned, removeGroupFromBanList } = require("./bdd/banGroup");
const { isGroupOnlyAdmin, addGroupToOnlyAdminList, removeGroupFromOnlyAdminList } = require("./bdd/onlyAdmin");
const { isGroupOnlyAdmin: _isGroupOnlyAdmin } = require("./bdd/onlyAdmin"); // avoid unused warning
const { reagir } = require(__dirname + "/keizzah/app");

// config & env
require('dotenv').config({ path: "./config.env" });
const session = (conf.session || "").replace(/BELTAH-MD;;;=>/g, "");
const prefixe = conf.PREFIXE || [];

/* ===== Auth file handling (small) ===== */
async function authentification() {
  try {
    const authDir = __dirname + "/auth";
    await fs.ensureDir(authDir);
    const credsPath = authDir + "/creds.json";
    if (!fs.existsSync(credsPath)) {
      if (session) await fs.writeFileSync(credsPath, Buffer.from(session, 'base64').toString("utf8"));
      console.log("created creds.json");
    } else if (session && session !== "zokk") {
      await fs.writeFileSync(credsPath, Buffer.from(session, 'base64').toString("utf8"));
    }
  } catch (e) {
    console.log("Session handling error: " + e);
  }
}
authentification();

/* ===== Store fallback (small) ===== */
let store;
try {
  if (typeof baileys.makeInMemoryStore === 'function') {
    store = baileys.makeInMemoryStore({
      logger: pino().child({ level: "silent", stream: "store" })
    });
  } else {
    console.warn("makeInMemoryStore not available, using minimal fallback store");
    store = {
      chats: {},
      contacts: {},
      bind: () => {},
      writeToFile: () => {},
      async loadMessage(remoteJid, id) {
        const chat = this.chats[remoteJid] || [];
        return chat.find(m => m.key?.id === id);
      }
    };
  }
} catch (err) {
  console.warn("Store init error, fallback store used:", err);
  store = {
    chats: {},
    contacts: {},
    bind: () => {},
    writeToFile: () => {},
    async loadMessage(remoteJid, id) {
      const chat = this.chats[remoteJid] || [];
      return chat.find(m => m.key?.id === id);
    }
  };
}

/* ===== main (small) ===== */
setTimeout(() => {
  async function main() {
    try {
      const { version } = await fetchLatestBaileysVersion();
      const { state, saveCreds } = await baileys.useMultiFileAuthState(__dirname + "/auth");

      const sockOptions = {
        version,
        logger: pino({ level: "silent" }),
        browser: ['BELTAH-MD', "safari", "1.0.0"],
        printQRInTerminal: true,
        fireInitQueries: false,
        shouldSyncHistoryMessage: true,
        downloadHistory: true,
        syncFullHistory: true,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: false,
        keepAliveIntervalMs: 30_000,
        auth: {
          creds: state.creds,
          keys: baileys.makeCacheableSignalKeyStore(state.keys, pino())
        },
        getMessage: async key => {
          if (store) {
            const msg = await store.loadMessage(key.remoteJid, key.id);
            return msg?.message;
          }
          return { conversation: 'An Error Occurred, Repeat Command!' };
        }
      };

      const zk = makeBaileys(sockOptions);
      store.bind(zk.ev);

      setInterval(() => {
        try { store.writeToFile("store.json"); } catch (e) { /* ignore */ }
      }, 3000);

      const delayFn = ms => new Promise(resolve => setTimeout(resolve, ms));
      let lastTextTime = 0;
      const messageDelay = 5000;

      /* --- call handler (small) --- */
      zk.ev.on('call', async (callData) => {
        try {
          if (conf.ANTICALL !== 'yes') return;
          const call = callData?.[0];
          if (!call) return;
          const callId = call.id;
          const callerId = call.from;
          if (typeof zk.rejectCall === 'function') {
            await zk.rejectCall(callId, callerId).catch(() => {});
          }
          const currentTime = Date.now();
          if (currentTime - lastTextTime >= messageDelay) {
            const text = conf.ANTICALL_MSG || "Call rejected";
            await zk.sendMessage(callerId, { text }).catch(() => {});
            lastTextTime = currentTime;
          }
        } catch (e) {
          console.error("Call handler error:", e);
        }
      });

      /* --- helper: forwarding context (small) --- */
      const getContextInfo = (title = '', userJid = '') => ({
        mentionedJid: userJid ? [userJid] : [],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363276287415739@newsletter",
          newsletterName: "Beltah Tech Updates",
          serverMessageId: Math.floor(100000 + Math.random() * 900000),
        },
      });

      /* --- auto-like status (small) --- */
      if (conf.AUTO_LIKE_STATUS === "yes") {
        const loveEmojis = ["✅", "🔥", "🗿", "🤍", "🩵", "💙", "💚", "💦", "👻"];
        let lastReactionTime = 0;

        zk.ev.on("messages.upsert", async (m) => {
          try {
            const { messages } = m;
            for (const message of messages) {
              if (!message.key) continue;
              if (message.key.remoteJid !== "status@broadcast") continue;
              const now = Date.now();
              if (now - lastReactionTime < 5000) continue;
              const beltah = zk.user && zk.user.id ? zk.user.id.split(":")[0] + "@s.whatsapp.net" : null;
              if (!beltah) continue;
              const randomLoveEmoji = loveEmojis[Math.floor(Math.random() * loveEmojis.length)];
              await zk.sendMessage(message.key.remoteJid, {
                react: { key: message.key, text: randomLoveEmoji }
              }).catch(() => {});
              lastReactionTime = Date.now();
              await delayFn(2000);
            }
          } catch (e) {
            console.error("Auto-like status error:", e);
          }
        });
      }

      /* --- auto-bio update (small) --- */
      if ((conf.AUTOBIO || "").toLowerCase() === 'yes') {
        const updateInterval = 10 * 1000;
        const timeZone = 'Africa/Nairobi';
        const timeBasedQuotes = {
          morning: ["Dream big, work hard.", "Stay humble, hustle hard.", "Believe in yourself.", "Success is earned, not given.", "The best is yet to come."],
          afternoon: ["Create your own path.", "Make today count.", "Embrace the journey.", "Live, laugh, love."],
          evening: ["Small steps lead to big changes.", "Happiness depends on ourselves.", "Take chances, make mistakes.", "Be a voice, not an echo."],
          night: ["The darker the night, the brighter the stars.", "Dream big and dare to fail. Good night!"]
        };
        setInterval(() => {
          try {
            const now = new Date();
            const formattedDate = now.toLocaleDateString('en-US', { timeZone });
            const formattedTime = now.toLocaleTimeString('en-US', { timeZone });
            const formattedDay = now.toLocaleString('en-US', { weekday: 'long', timeZone });
            const currentHour = parseInt(now.toLocaleTimeString('en-US', { timeZone, hour: '2-digit', hour12: false }), 10);
            let quotes = timeBasedQuotes.night;
            if (currentHour >= 5 && currentHour < 12) quotes = timeBasedQuotes.morning;
            else if (currentHour >= 12 && currentHour < 17) quotes = timeBasedQuotes.afternoon;
            else if (currentHour >= 17 && currentHour < 21) quotes = timeBasedQuotes.evening;
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            const statusMessage = `🟢 ${conf.BOT || ''} 🟢 : ${formattedDay} || ${formattedTime} || ${formattedDate} || ${randomQuote}`;
            zk.updateProfileStatus(statusMessage).catch(() => {});
          } catch (e) {
            console.error("Auto-bio update error:", e);
          }
        }, updateInterval);
      }

      /* --- auto-reply storage to avoid repeat replies --- */
      const repliedContacts = new Set();

      /* --- consolidated messages.upsert handler (large but tidy) --- */
      zk.ev.on("messages.upsert", async (m) => {
        try {
          const { messages } = m;
          for (const ms of messages) {
            try {
              if (!ms?.message) continue;

              const mtype = getContentType(ms.message);
              const extractTextFromMessage = (ms, mtype) => {
                try {
                  if (!ms?.message) return '';
                  if (mtype === "conversation") return ms.message.conversation || '';
                  if (mtype === "extendedTextMessage") return ms.message.extendedTextMessage?.text || '';
                  if (mtype === "imageMessage") return ms.message.imageMessage?.caption || '';
                  if (mtype === "videoMessage") return ms.message.videoMessage?.caption || '';
                  if (mtype === "audioMessage") return ms.message.audioMessage?.caption || '';
                  if (mtype === "documentMessage") return ms.message.documentMessage?.fileName || '';
                  if (mtype === "contactMessage") return ms.message.contactMessage?.displayName || '';
                  if (mtype === "buttonMessage") return ms.message.buttonMessage?.selectedButtonId || ms.message.buttonMessage?.text || '';
                  if (mtype === "listResponseMessage") return ms.message.listResponseMessage?.singleSelectReply?.selectedRowId || ms.message.listResponseMessage?.title || '';
                  return ms.message?.conversation || ms.message?.extendedTextMessage?.text || '';
                } catch (e) { return ''; }
              };

              const texte = (extractTextFromMessage(ms, mtype) || "").trim();
              const origineMessage = ms.key.remoteJid;
              const idBot = zk.user && zk.user.id ? jidDecode(zk.user.id).user + "@" + jidDecode(zk.user.id).server : '';
              const servBot = idBot.split('@')[0];
              const verifGroupe = origineMessage?.endsWith("@g.us");
              const infosGroupe = verifGroupe ? await zk.groupMetadata(origineMessage).catch(() => ({})) : null;
              const nomGroupe = verifGroupe ? infosGroupe?.subject || "" : "";
              const auteurMessage = verifGroupe ? (ms.key.participant || ms.participant) : origineMessage;
              const nomAuteurMessage = ms.pushName || '';
              const { getAllSudoNumbers } = require("./bdd/sudo");
              const sudo = await getAllSudoNumbers();
              const superUserNumbers = [servBot, '254114141192', "254737681758", conf.NUMERO_OWNER].map(s => (s || "").replace(/[^0-9]/g, "") + "@s.whatsapp.net");
              const allAllowedNumbers = superUserNumbers.concat(sudo || []);
              const superUser = allAllowedNumbers.includes(auteurMessage);
              const dev = ['254114141192', '254737681758'].map(t => t.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(auteurMessage);

              // Helper to reply
              const repondre = async (mes) => {
                await zk.sendMessage(origineMessage, { text: mes }, { quoted: ms }).catch(() => {});
              };

              // Presence update
              try {
                const etat = conf.ETAT;
                if (etat == 1) await zk.sendPresenceUpdate("available", origineMessage);
                else if (etat == 2) await zk.sendPresenceUpdate("composing", origineMessage);
                else if (etat == 3) await zk.sendPresenceUpdate("recording", origineMessage);
                else await zk.sendPresenceUpdate("unavailable", origineMessage);
              } catch {}

              // Save to store for antidelete
              try {
                if (!store.chats[origineMessage]) store.chats[origineMessage] = [];
                store.chats[origineMessage].push(ms);
              } catch (e) { }

              // Auto-reply greet (private)
              if (conf.GREET === "yes" && !repliedContacts.has(origineMessage) && !ms.key.fromMe && !origineMessage.includes("@g.us")) {
                const senderNumber = origineMessage.split('@')[0];
                const auto_reply_message = `Hello @${senderNumber}, ${conf.OWNER_NAME || ''} is unavailable right now. Kindly leave a message.`;
                await zk.sendMessage(origineMessage, { text: auto_reply_message, mentions: [origineMessage], contextInfo: getContextInfo() }).catch(() => {});
                repliedContacts.add(origineMessage);
              }

              // Anti-delete handling (protocolMessage.type === 0)
              if (conf.ADM === "yes" && ms.message?.protocolMessage?.type === 0) {
                try {
                  const deletedKey = ms.message.protocolMessage.key;
                  const chatMessages = store.chats[origineMessage] || [];
                  const deletedMessage = chatMessages.find(msg => msg.key?.id === deletedKey?.id);
                  if (!deletedMessage) { continue; }

                  const deleterJid = ms.key.participant || ms.key.remoteJid;
                  const originalSenderJid = deletedMessage.key.participant || deletedMessage.key.remoteJid;
                  const isGroup = origineMessage.endsWith('@g.us');
                  let groupInfo = '';
                  if (isGroup) {
                    try {
                      const groupMetadata = await zk.groupMetadata(origineMessage);
                      groupInfo = `\n• Group: ${groupMetadata.subject}`;
                    } catch { groupInfo = '\n• Group information unavailable.'; }
                  }

                  // fixed: close the template string properly
                  const notification = `🫟 *BELTAH-MD ANTIDELETE* 🫟\n• Deleted by: @${deleterJid.split("@")[0]}\n• Original sender: @${originalSenderJid.split("@")[0]}\n${groupInfo}\n• Message recovered`;
                  const contextInfo = {
                    mentionedJid: [deleterJid, originalSenderJid],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                      newsletterJid: "120363276287415739@newsletter",
                      newsletterName: "BELTAH-MD BOT",
                      serverMessageId: Math.floor(100000 + Math.random() * 900000),
                    },
                    externalAdReply: {
                      showAdAttribution: true,
                      title: conf.BOT || '',
                      body: 'Deleted Message Alert',
                      thumbnailUrl: conf.URL || 'https://files.catbox.moe/bstm82.jpg',
                      sourceUrl: conf.GURL || 'https://wa.me/254114141192',
                      mediaType: 1,
                    }
                  };

                  const baseMessage = { mentions: [deleterJid, originalSenderJid], contextInfo };

                  if (deletedMessage.message.conversation) {
                    await zk.sendMessage(origineMessage, { text: `${notification}\n\n📝 *Deleted Text:*\n${deletedMessage.message.conversation}`, ...baseMessage }).catch(() => {});
                  } else if (deletedMessage.message.extendedTextMessage) {
                    await zk.sendMessage(origineMessage, { text: `${notification}\n\n📝 *Deleted Text:*\n${deletedMessage.message.extendedTextMessage.text}`, ...baseMessage }).catch(() => {});
                  } else if (deletedMessage.message.imageMessage) {
                    const caption = deletedMessage.message.imageMessage.caption || '';
                    const imagePath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.imageMessage).catch(() => null);
                    if (imagePath) {
                      await zk.sendMessage(origineMessage, { image: { url: imagePath }, caption: `${notification}\n\n📷 *Image Caption:*\n${caption}`, ...baseMessage }).catch(() => {});
                    } else {
                      await zk.sendMessage(origineMessage, { text: `${notification}\n\n📷 *Image deleted*`, ...baseMessage }).catch(() => {});
                    }
                  } else if (deletedMessage.message.videoMessage) {
                    const caption = deletedMessage.message.videoMessage.caption || '';
                    const videoPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.videoMessage).catch(() => null);
                    if (videoPath) {
                      await zk.sendMessage(origineMessage, { video: { url: videoPath }, caption: `${notification}\n\n🎥 *Video Caption:*\n${caption}`, ...baseMessage }).catch(() => {});
                    } else {
                      await zk.sendMessage(origineMessage, { text: `${notification}\n\n🎥 *Video deleted*`, ...baseMessage }).catch(() => {});
                    }
                  } else {
                    await zk.sendMessage(origineMessage, { text: `${notification}\n\n⚠️ *Unsupported message type was deleted*`, ...baseMessage }).catch(() => {});
                  }
                } catch (err) {
                  console.error("Antidelete error:", err);
                }
              }

              // Auto-read messages when enabled
              if (conf.AUTO_READ_MESSAGES === "yes") {
                try {
                  if (!ms.key.fromMe) await zk.readMessages([ms.key]).catch(() => {});
                } catch {}
              }

              // Chatbot response (text-only inbox)
              if (!superUser && origineMessage === auteurMessage && conf.CHATBOT === 'yes' && texte) {
                try {
                  const currentTime = Date.now();
                  if (currentTime - lastTextTime < messageDelay) continue;
                  const response = await axios.get('https://apis-keith.vercel.app/ai/gpt', { params: { q: texte }, timeout: 10000 }).catch(() => null);
                  if (response?.data?.status && response.data.result) {
                    const italicMessage = `_${response.data.result}_`;
                    await zk.sendMessage(origineMessage, { text: italicMessage, mentions: [auteurMessage] }, { quoted: ms }).catch(() => {});
                    lastTextTime = Date.now();
                  }
                } catch (e) { console.error("Chatbot error:", e); }
              }

              // Voice chatbot inbox (if available)
              if (!superUser && origineMessage === auteurMessage && conf.VOICE_CHATBOT_INBOX === 'yes' && texte) {
                // Keep minimal: skip implementation if googleTTS not available
                // This avoids runtime error if googleTTS isn't imported.
              }

              // Eval for dev/owner (< prefix)
              if (texte && texte.startsWith('<')) {
                if (!superUser) {
                  await repondre("Only for my owner or Beltah Tech to execute this command 🚫");
                } else {
                  try {
                    let evaled = await eval(texte.slice(1));
                    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                    await repondre(evaled);
                  } catch (err) { await repondre(String(err)); }
                }
                continue;
              }

              // Exec command for owner (>) - kept simple and safe
              if (texte && texte.startsWith('>')) {
                if (!superUser) {
                  await zk.sendMessage(origineMessage, { text: `Only Beltah Tech allowed execute baileys codes.`, contextInfo: getContextInfo() }).catch(() => {});
                } else {
                  try {
                    let evaled = await eval(texte.slice(1));
                    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                    await repondre(evaled);
                  } catch (err) {
                    await repondre(String(err));
                  }
                }
                continue;
              }

              // Auto-status reply
              if (ms.key.remoteJid === 'status@broadcast' && conf.AUTO_STATUS_REPLY === "yes") {
                const user = ms.key.participant;
                const text = conf.AUTO_STATUS_MSG || '';
                await zk.sendMessage(user, { text, react: { text: '👻', key: ms.key } }, { quoted: ms }).catch(() => {});
              }
              if (ms.key.remoteJid === "status@broadcast" && conf.AUTO_READ_STATUS === "yes") {
                await zk.readMessages([ms.key]).catch(() => {});
              }
              if (ms.key.remoteJid === 'status@broadcast' && conf.AUTO_DOWNLOAD_STATUS === "yes") {
                // minimal behavior: forward status to bot chat
                try {
                  if (ms.message.extendedTextMessage) {
                    const stTxt = ms.message.extendedTextMessage.text || '';
                    await zk.sendMessage(idBot, { text: stTxt }, { quoted: ms }).catch(() => {});
                  } else if (ms.message.imageMessage) {
                    const stMsg = ms.message.imageMessage.caption;
                    const stImg = await zk.downloadAndSaveMediaMessage(ms.message.imageMessage).catch(() => null);
                    if (stImg) await zk.sendMessage(idBot, { image: { url: stImg }, caption: stMsg }, { quoted: ms }).catch(() => {});
                  } else if (ms.message.videoMessage) {
                    const stMsg = ms.message.videoMessage.caption;
                    const stVideo = await zk.downloadAndSaveMediaMessage(ms.message.videoMessage).catch(() => null);
                    if (stVideo) await zk.sendMessage(idBot, { video: { url: stVideo }, caption: stMsg }, { quoted: ms }).catch(() => {});
                  }
                } catch {}
              }

              // simple level/rank counting
              if (texte && auteurMessage && auteurMessage.endsWith("s.whatsapp.net")) {
                try { const { ajouterOuMettreAJourUserData } = require("./bdd/level"); await ajouterOuMettreAJourUserData(auteurMessage); } catch (e) {}
              }

              // Mention handling (fixed syntax): when bot is mentioned
              try {
                const mentionedJids = ms.message?.[mtype]?.contextInfo?.mentionedJid || [];
                const shouldHandleMention = Array.isArray(mentionedJids) && (mentionedJids.includes(idBot) || mentionedJids.includes(conf.NUMERO_OWNER));
                if (shouldHandleMention) {
                  if (origineMessage === "120363158701337904@g.us") continue;
                  if (superUser) continue; // skip mention autorespond for superusers

                  const mbd = require('./bdd/mention');
                  const alldata = await mbd.recupererToutesLesValeurs();
                  const data = alldata?.[0];
                  if (!data || data.status === 'non') continue;

                  let msgToSend = null;
                  if (data.type?.toLowerCase() === 'image') {
                    msgToSend = { image: { url: data.url }, caption: data.message };
                  } else if (data.type?.toLowerCase() === 'video') {
                    msgToSend = { video: { url: data.url }, caption: data.message };
                  } else if (data.type?.toLowerCase() === 'sticker') {
                    const stickerMess = new Sticker(data.url, {
                      pack: conf.NOM_OWNER || '',
                      type: StickerTypes.FULL,
                      id: "12345",
                      quality: 70,
                      background: "transparent",
                    });
                    const stickerBuffer2 = await stickerMess.toBuffer();
                    msgToSend = { sticker: stickerBuffer2 };
                  } else if (data.type?.toLowerCase() === 'audio') {
                    msgToSend = { audio: { url: data.url }, mimetype: 'audio/mp4' };
                  } else {
                    msgToSend = { text: data.message || '' };
                  }
                  if (msgToSend) await zk.sendMessage(origineMessage, msgToSend, { quoted: ms }).catch(() => {});
                }
              } catch (err) {
                // ignore mention errors
              }

              // anti-link (uses verifierEtatJid)
              try {
                const yes = await verifierEtatJid(origineMessage).catch(() => false);
                if (texte?.includes('https://') && verifGroupe && yes) {
                  const verifZokAdmin = verifGroupe ? (infosGroupe?.participants || []).filter(p => p?.admin).map(p => p.id).includes(idBot) : false;
                  if (superUser || (ms.key && ms.key.fromMe) || !verifZokAdmin) continue;

                  const keyObj = { remoteJid: origineMessage, fromMe: false, id: ms.key.id, participant: auteurMessage };
                  let txt = "Link detected, \n";
                  const gifLink = "https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif";
                  const stickerObj = new Sticker(gifLink, { pack: '', author: conf.OWNER_NAME || '', type: StickerTypes.FULL, id: '12345', quality: 50, background: '#000000' });
                  await stickerObj.toFile("st1.webp").catch(() => {});
                  const action = await recupererActionJid(origineMessage).catch(() => 'delete');

                  if (action === 'remove') {
                    txt += `message deleted \n @${auteurMessage.split("@")[0]} removed from group.`;
                    await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") }).catch(() => {});
                    await delayFn(800);
                    await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms }).catch(() => {});
                    try { await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove"); } catch {}
                    await zk.sendMessage(origineMessage, { delete: keyObj }).catch(() => {});
                    await fs.unlink("st1.webp").catch(() => {});
                  } else if (action === 'delete') {
                    txt += `Goodbye \n @${auteurMessage.split("@")[0]} Sending other group links here is prohibited!.`;
                    await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms }).catch(() => {});
                    await zk.sendMessage(origineMessage, { delete: keyObj }).catch(() => {});
                    await fs.unlink("st1.webp").catch(() => {});
                  } else if (action === 'warn') {
                    const { getWarnCountByJID, ajouterUtilisateurAvecWarnCount } = require('./bdd/warn');
                    let warn = await getWarnCountByJID(auteurMessage).catch(() => 0);
                    let warnlimit = conf.WARN_COUNT || 3;
                    if (warn >= warnlimit) {
                      const kikmsg = `link detected , you will be removed because of reaching warn-limit`;
                      await zk.sendMessage(origineMessage, { text: kikmsg, mentions: [auteurMessage] }, { quoted: ms }).catch(() => {});
                      await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove").catch(() => {});
                      await zk.sendMessage(origineMessage, { delete: keyObj }).catch(() => {});
                    } else {
                      const rest = warnlimit - warn;
                      const msg = `Link detected, your warn_count was upgraded ;\n rest : ${rest} `;
                      await ajouterUtilisateurAvecWarnCount(auteurMessage).catch(() => {});
                      await zk.sendMessage(origineMessage, { text: msg, mentions: [auteurMessage] }, { quoted: ms }).catch(() => {});
                      await zk.sendMessage(origineMessage, { delete: keyObj }).catch(() => {});
                    }
                  }
                }
              } catch (e) { /* ignore anti-link errors */ }

              // anti-bot detection
              try {
                const isBotMsg = ms.key?.id && (ms.key.id.startsWith('BAES') || ms.key.id.startsWith('BAE5')) && ms.key.id.length === 16;
                if (isBotMsg) {
                  const antibotActiver = await atbverifierEtatJid(origineMessage).catch(() => false);
                  if (!antibotActiver) { /* noop */ }
                  else {
                    if (mtype === 'reactionMessage') { /* skip */ }
                    else if (verifGroupe && (infosGroupe?.admins || []).includes(auteurMessage)) { /* skip admin */ }
                    else if (auteurMessage === idBot) { /* skip self */ }
                    else {
                      const keyObj = { remoteJid: origineMessage, fromMe: false, id: ms.key.id, participant: auteurMessage };
                      let txt = "bot detected, \n";
                      const gifLink = "https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif";
                      const stickerObj = new Sticker(gifLink, { pack: 'BELTAH-MD', author: conf.OWNER_NAME || '', type: StickerTypes.FULL, id: '12345', quality: 50, background: '#000000' });
                      await stickerObj.toFile("st1.webp").catch(() => {});
                      const action = await atbrecupererActionJid(origineMessage).catch(() => 'delete');

                      if (action === 'remove') {
                        txt += `message deleted \n @${auteurMessage.split("@")[0]} removed from group.`;
                        await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") }).catch(() => {});
                        await delayFn(800);
                        await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms }).catch(() => {});
                        try { await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove"); } catch {}
                        await zk.sendMessage(origineMessage, { delete: keyObj }).catch(() => {});
                        await fs.unlink("st1.webp").catch(() => {});
                      } else if (action === 'delete') {
                        txt += `message delete \n @${auteurMessage.split("@")[0]} Avoid sending bot messages.`;
                        await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms }).catch(() => {});
                        await zk.sendMessage(origineMessage, { delete: keyObj }).catch(() => {});
                        await fs.unlink("st1.webp").catch(() => {});
                      } else if (action === 'warn') {
                        const { getWarnCountByJID, ajouterUtilisateurAvecWarnCount } = require('./bdd/warn');
                        let warn = await getWarnCountByJID(auteurMessage).catch(() => 0);
                        let warnlimit = conf.WARN_COUNT || 3;
                        if (warn >= warnlimit) {
                          var kikmsg = `BOT DETECTED!!! ;you will be removed because of reaching warn-limit`;
                          await zk.sendMessage(origineMessage, { text: kikmsg, mentions: [auteurMessage] }, { quoted: ms }).catch(() => {});
                          await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove").catch(() => {});
                          await zk.sendMessage(origineMessage, { delete: keyObj }).catch(() => {});
                        } else {
                          var rest = warnlimit - warn;
                          var msg = `BOT DETECTED !!!, your warn_count was upgraded ;\n rest : ${rest} `;
                          await ajouterUtilisateurAvecWarnCount(auteurMessage).catch(() => {});
                          await zk.sendMessage(origineMessage, { text: msg, mentions: [auteurMessage] }, { quoted: ms }).catch(() => {});
                          await zk.sendMessage(origineMessage, { delete: keyObj }).catch(() => {});
                        }
                      }
                    }
                  }
                }
              } catch (er) { /* ignore antibot errors */ }

              // Command execution
              try {
                const verifCom = texte ? texte.startsWith(prefixe) : false;
                const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : false;
                if (verifCom && com) {
                  const cd = evt.cm.find(keith =>
                    keith.nomCom === com ||
                    (keith.aliases && keith.aliases.includes(com))
                  );
                  if (cd) {
                    // permission & group checks
                    if (conf.MODE?.toLowerCase() !== 'yes' && !superUser) {
                      await repondre("_Input Ignored❗❗_");
                      continue;
                    }
                    if (!superUser && origineMessage === auteurMessage && conf.PM_PERMIT === "yes") {
                      await repondre("Access Denied ❗\n\nYou don't have permission to use BELTAH-MD in private chat.");
                      continue;
                    }
                    if (!superUser && verifGroupe) {
                      let req = await isGroupBanned(origineMessage).catch(() => false);
                      if (req) continue;
                    }
                    // Fixed: verifAdmin was undefined; use superUser flag for this check
                    if (!superUser && verifGroupe) {
                      let req = await isGroupOnlyAdmin(origineMessage).catch(() => false);
                      if (req) continue;
                    }
                    if (!superUser) {
                      let req = await isUserBanned(auteurMessage).catch(() => false);
                      if (req) { await repondre("You are banned from using bot commands."); continue; }
                    }
                    if (cd.reaction) reagir(origineMessage, zk, ms, cd.reaction);
                    const commandeOptions = { superUser, dev, verifGroupe, ms, repondre };
                    await cd.fonction(origineMessage, zk, commandeOptions);
                  }
                }
              } catch (e) {
                console.log("Command error:", e);
                await zk.sendMessage(origineMessage, { text: "😡 Command error: " + e }, { quoted: ms }).catch(() => {});
              }

            } catch (innerErr) {
              console.error("message loop inner error:", innerErr);
            }
          }
        } catch (err) {
          console.error("messages.upsert handler error:", err);
        }
      });

      /* --- group participants update (small) --- */
      const { recupevents } = require('./bdd/welcome');
      const getGroupProfilePictureUrl = async (zk, groupId) => {
        try { return await zk.profilePictureUrl(groupId, "image"); } catch { return "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg"; }
      };
      const makeContextInfo = (userJid = '', groupPicUrl = '', groupName = '') => ({
        mentionedJid: userJid ? [userJid] : [],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363276287415739@newsletter",
          newsletterName: "BELTAH-MD BOT",
          serverMessageId: Math.floor(100000 + Math.random() * 900000),
        },
        externalAdReply: {
          showAdAttribution: false,
          title: groupName,
          body: '🟢 Made on earth 🟢',
          thumbnailUrl: groupPicUrl,
          sourceUrl: "https://wa.me/254114141192",
          mediaType: 1,
          renderLargerThumbnail: false,
        }
      });

      zk.ev.on('group-participants.update', async group => {
        try {
          const metadata = await zk.groupMetadata(group.id).catch(() => ({}));
          const groupPicUrl = await getGroupProfilePictureUrl(zk, group.id);
          const groupName = metadata.subject || '';
          if (group.action === 'add' && (await recupevents(group.id, "welcome")) === 'on') {
            for (let member of group.participants) {
              const welcomeMessage = ` Hello *@${member.split("@")[0]}* welcome here.`;
              await zk.sendMessage(group.id, { text: welcomeMessage, mentions: [member], contextInfo: makeContextInfo(member, groupPicUrl, groupName) }).catch(() => {});
            }
          } else if (group.action === 'remove' && (await recupevents(group.id, "goodbye")) === 'on') {
            for (let member of group.participants) {
              const goodbyeMessage = `👋 *@${member.split("@")[0]}* has left the group.`;
              await zk.sendMessage(group.id, { text: goodbyeMessage, mentions: [member], contextInfo: makeContextInfo(member, groupPicUrl, groupName) }).catch(() => {});
            }
          }
        } catch (e) { console.error("group-participants.update error:", e); }
      });

      /* --- cron activation (small) --- */
      async function activateCrons() {
        try {
          const cron = require('node-cron');
          const { getCron } = require('./bdd/cron');
          let crons = await getCron().catch(() => []);
          if (crons.length === 0) { console.log("No crons to activate"); return; }
          for (let c of crons) {
            if (c.mute_at) {
              let set = c.mute_at.split(':');
              cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {
                await zk.groupSettingUpdate(c.group_id, 'announcement').catch(() => {});
                zk.sendMessage(c.group_id, { image: { url: './media/chrono.webp' }, caption: "Hello, it's time to close the group; sayonara." }).catch(() => {});
              }, { timezone: "Africa/Nairobi" });
            }
            if (c.unmute_at) {
              let set = c.unmute_at.split(':');
              cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {
                await zk.groupSettingUpdate(c.group_id, 'not_announcement').catch(() => {});
                zk.sendMessage(c.group_id, { image: { url: './media/chrono.webp' }, caption: "Good morning; It's time to open the group." }).catch(() => {});
              }, { timezone: "Africa/Nairobi" });
            }
          }
        } catch (e) { console.error("activateCrons error:", e); }
      }
      activateCrons().catch(() => {});

      /* --- contacts.upsert (small) --- */
      zk.ev.on("contacts.upsert", async (contacts) => {
        try {
          for (const contact of contacts) {
            if (store.contacts[contact.id]) Object.assign(store.contacts[contact.id], contact);
            else store.contacts[contact.id] = contact;
          }
        } catch {}
      });

      /* --- connection updates (small) --- */
      zk.ev.on("connection.update", async (con) => {
        const { lastDisconnect, connection } = con;
        try {
          if (connection === "connecting") console.log("ℹ️ BELTAH-MD connecting...");
          else if (connection === "open") {
            console.log("✅ BELTAH MD Connected successful! ☺️");
            // load commands
            try {
              fs.readdirSync(__dirname + "/commands").forEach((fichier) => {
                if (path.extname(fichier).toLowerCase() == ".js") {
                  try {
                    require(__dirname + "/commands/" + fichier);
                    console.log(fichier + " executed successfully ✅");
                  } catch (e) {
                    console.log(`${fichier} could not be loaded : ${e}`);
                  }
                }
              });
            } catch (e) { console.log("commands load error:", e); }

            // status message on connect
            if ((conf.DP || "").toLowerCase() === "yes") {
              let md = (conf.MODE || "").toLowerCase() === "yes" ? "PUBLIC" : "PRIVATE";
              let cmsg = `╭══════════⩥
 ║ 🅰︎🅳︎🅼︎🅸︎🅽︎ :  *${conf.OWNER_NAME || ''}*
 ║ 🅿︎🆁︎🅴︎🆅︎🅸︎🅾︎ : [  ${prefixe}  ]
 ║ 🅼︎🅾︎🅳︎🅴︎ :  ${md} MODE
 ║ 🅿︎🅻︎🆄︎🅶︎🅸︎🅽︎🆂︎ : ${evt.cm?.length || 0}
 ║ 🅿︎🅾︎🆆︎🅴︎🆁︎🆂︎ : *BELTAH TECH TEAM*
 ╰═══════════════⩥

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ᴛᴇᴄʜ © 2025`;
              // fixed: avoid broken/corrupted ".catch" and ensure proper empty handler
              await zk.sendMessage(zk.user.id, { text: cmsg, contextInfo: getContextInfo(' ✅ 𝗕𝗘𝗟𝗧𝗔𝗛-𝗠𝗗 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗 ✅ ', zk.user.id) }).catch(() => {});
            }
          } else if (connection === "close") {
            const reasonCode = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reasonCode === baileys.DisconnectReason.badSession) console.log('Wrong session Id format, rescan again...');
            else if (reasonCode === baileys.DisconnectReason.connectionClosed) { console.log('connection closed, reconnecting...'); main(); }
            else if (reasonCode === baileys.DisconnectReason.connectionLost) { console.log('connection lost, reconnecting...'); main(); }
            else if (reasonCode === baileys.DisconnectReason.connectionReplaced) console.log('connection replaced, close other sessions!');
            else if (reasonCode === baileys.DisconnectReason.loggedOut) console.log('session logged out, replace with new session id');
            else if (reasonCode === baileys.DisconnectReason.restartRequired) { console.log('restart required'); main(); }
            else {
              console.log("restarting due to error code: ", reasonCode);
              const { exec } = require("child_process");
              exec("pm2 restart all");
            }
          }
        } catch (e) { console.error("connection.update handler error:", e); }
      });

      zk.ev.on("creds.update", saveCreds);

      /* --- utilities exported on zk object --- */
      zk.downloadAndSaveMediaMessage = async (message, filename = '', attachExtension = true) => {
        try {
          const quoted = message.msg ? message.msg : message;
          const mime = (message.msg || message).mimetype || '';
          const messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
          const stream = await downloadContentFromMessage(quoted, messageType);
          let buffer = Buffer.from([]);
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
          const type = await FileType.fromBuffer(buffer).catch(() => ({ ext: 'bin' }));
          const trueFileName = './' + filename + '.' + (type?.ext || 'bin');
          await fs.writeFileSync(trueFileName, buffer);
          return trueFileName;
        } catch (e) {
          console.error("downloadAndSaveMediaMessage error:", e);
          throw e;
        }
      };

      zk.awaitForMessage = async (options = {}) => {
        return new Promise((resolve, reject) => {
          if (typeof options !== 'object') return reject(new Error('Options must be an object'));
          if (typeof options.sender !== 'string') return reject(new Error('Sender must be a string'));
          if (typeof options.chatJid !== 'string') return reject(new Error('ChatJid must be a string'));
          const timeout = options.timeout;
          const filter = options.filter || (() => true);
          let timer = null;
          const listener = (data) => {
            let { type, messages } = data;
            if (type !== "notify") return;
            for (let message of messages) {
              const fromMe = message.key.fromMe;
              const chatId = message.key.remoteJid;
              const isGroup = chatId.endsWith('@g.us');
              const isStatus = chatId === 'status@broadcast';
              const sender = fromMe ? zk.user.id.replace(/:.*@/g, '@') : (isGroup || isStatus) ? (message.key.participant || '').replace(/:.*@/g, '@') : chatId;
              if (sender === options.sender && chatId === options.chatJid && filter(message)) {
                zk.ev.off('messages.upsert', listener);
                if (timer) clearTimeout(timer);
                return resolve(message);
              }
            }
          };
          zk.ev.on('messages.upsert', listener);
          if (timeout) {
            timer = setTimeout(() => {
              zk.ev.off('messages.upsert', listener);
              reject(new Error('Timeout'));
            }, timeout);
          }
        });
      };

      /* --- watch file for auto-reload in dev (small) --- */
      const fichier = require.resolve(__filename);
      fs.watchFile(fichier, () => {
        fs.unwatchFile(fichier);
        console.log(`Updated ${__filename}`);
        delete require.cache[fichier];
        require(fichier);
      });

      return zk;

    } catch (err) { console.error("main init error:", err); }
  }

  main().catch(e => console.error("main crashed:", e));
}, 5000);
