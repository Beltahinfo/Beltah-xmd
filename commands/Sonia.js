const { keith } = require("../keizzah/keith");
const axios = require('axios');
const ytSearch = require('yt-search');
const conf = require(__dirname + '/../set');
const { Catbox } = require("node-catbox");
const fs = require('fs-extra');
const { repondre } = require(__dirname + "/../keizzah/context");

// === MENU TRACKER FOR INTERACTIVE DOWNLOAD MENU ===
const menuTrack = new Map(); // messageId => { video, userJid }

// Utility: You need to define or import getContextInfo and searchYouTube and downloadFromApis somewhere above this code block.
// Example for searchYouTube:
async function searchYouTube(query) {
  const results = await ytSearch(query);
  return results.videos[0];
}
// Example for getContextInfo (dummy, adapt as needed):
function getContextInfo(title, userJid, thumbnail) {
  return { externalAdReply: { title, sourceUrl: '', mediaUrl: thumbnail, mediaType: 1, thumbnailUrl: thumbnail, previewType: 'PHOTO', showAdAttribution: true }, mentionedJid: [userJid] };
}
// Example for downloadFromApis (audio):
async function downloadFromApis(apis) {
  for (let api of apis) {
    try {
      const { data } = await axios.get(api);
      if (data.result && data.result.download_url) return data;
    } catch (e) {}
  }
  throw new Error("No working audio API found.");
}
// Example for downloadVideoFromApis (video):
async function downloadVideoFromApis(videoUrl) {
  const apis = [
  `https://noobs-api.top/ytmp3?url=${encodeURIComponent(video.url)}`
];
  for (let api of apis) {
    try {
      const { data } = await axios.get(api);
      if (data.result && data.result.download_url) return data;
    } catch (e) {}
  }
  throw new Error("No working video API found.");
}

// Interactive menu command
keith({
  nomCom: "lay",
  aliases: ["song", "playdoc", "audio", "mp3"],
  categorie: "download",
  reaction: "🎵"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, userJid } = commandOptions;

  try {
    if (!arg[0]) {
      return repondre(zk, dest, ms, "Please provide a song name.");
    }

    const query = arg.join(" ");
    const video = await searchYouTube(query);

    const menuMessage = `*${video.title}*\n\n` +
      `🧺 DOWNLOAD OPTIONS - Reply with number:\n` +
      `1. 🎵 Download Audio\n` +
      `2. 🎥 Download Video\n\n` +
      `Reply with any number above to proceed\nThis menu stays active - you can use it multiple times`;

    // Send the menu and track its message ID
    const sentMsg = await zk.sendMessage(dest, {
      image: { url: video.thumbnail },
      caption: menuMessage,
      contextInfo: getContextInfo(video.title, userJid, video.thumbnail)
    }, { quoted: ms });

    // Track the menu message for reply handling
    menuTrack.set(sentMsg.key.id, { video, userJid });

  } catch (error) {
    console.error('Audio/video download error:', error);
    repondre(zk, dest, ms, `Download failed: ${error.message}`);
  }
});

// === GLOBAL HANDLER FOR REPLIES TO THE MENU ===
async function handleIncomingMessage(msg, zk) {
  // WhatsApp reply check
  const isReply = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
  if (!isReply) return;

  const repliedMsgId = msg.message.extendedTextMessage.contextInfo.stanzaId;
  if (!menuTrack.has(repliedMsgId)) return; // Not a reply to our menu

  const { video, userJid } = menuTrack.get(repliedMsgId);

  // Only allow the original requester to interact (optional)
  if (msg.key.participant !== userJid) {
    return repondre(zk, msg.key.remoteJid, msg, "This menu isn't for you.");
  }

  const userReply = msg.message.conversation?.trim();
  if (userReply === "1") {
    await repondre(zk, msg.key.remoteJid, msg, `Downloading audio for: ${video.title}`);
    // Audio download logic
    try {
      const apis = [
  `https://noobs-api.top/ytmp3?url=${encodeURIComponent(video.url)}`
];
      const downloadData = await downloadFromApis(apis);
      const { download_url, title } = downloadData.result;

      const audioPayload = {
        audio: { url: download_url },
        mimetype: 'audio/mp4',
        caption: `🎵 *${title}*`,
        contextInfo: getContextInfo(title, userJid, video.thumbnail)
      };
      await zk.sendMessage(msg.key.remoteJid, audioPayload, { quoted: msg });
    } catch (e) {
      await repondre(zk, msg.key.remoteJid, msg, "Audio download failed.");
    }
  } else if (userReply === "2") {
    await repondre(zk, msg.key.remoteJid, msg, `Downloading video for: ${video.title}`);
    // Video download logic
    try {
      const downloadData = await downloadVideoFromApis(video.url);
      const { download_url, title } = downloadData.result;

      const videoPayload = {
        video: { url: download_url },
        mimetype: 'video/mp4',
        caption: `🎥 *${title}*`,
        contextInfo: getContextInfo(title, userJid, video.thumbnail)
      };
      await zk.sendMessage(msg.key.remoteJid, videoPayload, { quoted: msg });
    } catch (e) {
      await repondre(zk, msg.key.remoteJid, msg, "Video download failed.");
    }
  } else {
    await repondre(zk, msg.key.remoteJid, msg, "Please reply with 1 (audio) or 2 (video).");
  }
}

// ... rest of code ...
