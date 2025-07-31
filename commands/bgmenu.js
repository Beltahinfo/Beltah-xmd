const util = require('util');
const fs = require('fs-extra');
const { keith } = require(__dirname + "/../keizzah/keith");
const { format } = require(__dirname + "/../keizzah/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const { repondre } = require(__dirname + "/../keizzah/context");
const more = String.fromCharCode(8206);
const Taphere = more.repeat(4001);

// Common contextInfo configuration
const getContextInfo = (title = '', userJid = '', thumbnailUrl = '') => ({
  mentionedJid: userJid ? [userJid] : [],
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363249464136503@newsletter",
    newsletterName: "Beltah Tech Updates",
    serverMessageId: Math.floor(100000 + Math.random() * 900000),
  },
  externalAdReply: {
    showAdAttribution: true,
    title: title || "𝗕𝗘𝗟𝗧𝗔𝗛 𝗞𝗜𝗟𝗟𝗘𝗥 😵",
    body: "𝗜𝘁 𝗶𝘀 𝗻𝗼𝘁 𝘆𝗲𝘁 𝘂𝗻𝘁𝗶𝗹 𝗶𝘁 𝗶𝘀 𝗱𝗼𝗻𝗲🗿",
    thumbnailUrl: thumbnailUrl || 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg',
    sourceUrl: (typeof settings !== "undefined" && settings.GURL) ? settings.GURL : '',
    mediaType: 1,
    renderLargerThumbnail: false
  }
});

keith({ nomCom: "bugmenu", categorie: "General" }, async (dest, zk, commandeOptions) => {
  let { ms, repondre, prefixe, nomAuteurMessage, mybotpic, sender } = commandeOptions;
  let { cm } = require(__dirname + "/../keizzah/keith");
  let coms = {};
  let mode = (String(s.MODE).toLocaleLowerCase() === "yes") ? "public" : "private";

  cm.forEach((com) => {
    if (!coms[com.categorie]) coms[com.categorie] = [];
    coms[com.categorie].push(com.nomCom);
  });

  moment.tz.setDefault("Africa/Nairobi");
  const temps = moment().format('HH:mm:ss');
  const date = moment().format('DD/MM/YYYY');

  let infoMsg = `
┏❏ ⌜ *𝐁𝐄𝐋𝐓𝐀𝐇 𝐌𝐃 𝐁𝐔𝐆* ⌟  ❐
❐ ${prefixe}bug
❐ ${prefixe}crash
❐ ${prefixe}loccrash
❐ ${prefixe}amountbug <amount>
❐ ${prefixe}crashbug 254XXXX
❐ ${prefixe}pmbug 254XXXX
❐ ${prefixe}delaybug 254XXXX
❐ ${prefixe}trollybug 254XXXX
❐ ${prefixe}docubug 254XXXX
❐ ${prefixe}unlimitedbug 254XXXX
❐ ${prefixe}bombug 254XXXX
❐ ${prefixe}lagbug 254XXXX
❐ ${prefixe}gcbug <grouplink>
❐ ${prefixe}delaygcbug <grouplink>
❐ ${prefixe}trollygcbug <grouplink>
❐ ${prefixe}laggcbug <grouplink>
❐ ${prefixe}bomgcbug <grouplink>
❐ ${prefixe}unlimitedgcbug <grouplink>
❐ ${prefixe}docugcbug <grouplink>

⏲️ *TIME*: ${temps}
📅 *DATE*: ${date}
`;

  let menuMsg = `
𝐑𝐞𝐠𝐚𝐫𝐝𝐬 𝐁𝐄𝐋𝐓𝐀𝐇 𝐌𝐃
`;

  try {
    const lien = await mybotpic();
    // If lien is a video/gif
    if (lien.match(/\.(mp4|gif)$/i)) {
      await zk.sendMessage(
        dest,
        {
          video: { url: lien },
          caption: infoMsg + menuMsg,
          footer: "Je suis *keithkeizzah*, développeur keithkeizzah",
          gifPlayback: true,
          contextInfo: getContextInfo(
            "𝗕𝗘𝗟𝗧𝗔𝗛 𝗞𝗜𝗟𝗟𝗘𝗥 😵",
            ms?.sender || sender,
            'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg'
          )
        },
        { quoted: ms }
      );
    }
    // If lien is a picture
    else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
      await zk.sendMessage(
        dest,
        {
          image: { url: lien },
          caption: infoMsg + menuMsg,
          footer: "Je suis *keithkeizzah*, développeur keithkeizzah",
          contextInfo: getContextInfo(
            "𝗕𝗘𝗟𝗧𝗔𝗛 𝗞𝗜𝗟𝗟𝗘𝗥 😵",
            ms?.sender || sender,
            lien
          )
        },
        { quoted: ms }
      );
    }
    // If lien is not media, just send text with contextInfo
    else {
      await zk.sendMessage(
        dest,
        {
          text: infoMsg + menuMsg,
          contextInfo: getContextInfo(
            "𝗕𝗘𝗟𝗧𝗔𝗛 𝗞𝗜𝗟𝗟𝗘𝗥 😵",
            ms?.sender || sender,
            'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg'
          )
        },
        { quoted: ms }
      );
    }
  } catch (e) {
    console.log("🥵🥵 Menu erreur " + e);
    repondre("🥵🥵 Menu erreur " + e);
  }
});
