const { keith } = require("../keizzah/keith");
const axios = require('axios');
const ytSearch = require('yt-search');
const conf = require(__dirname + '/../set');
const { Catbox } = require("node-catbox");
const fs = require('fs-extra');
const { repondre } = require(__dirname + "/../keizzah/context");

const catbox = new Catbox();

const DEFAULT_PARTICIPANT = '0@s.whatsapp.net';
const DEFAULT_REMOTE_JID = 'status@broadcast';
const DEFAULT_THUMBNAIL_URL = 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg';
const DEFAULT_TITLE = "BELTAH-MD MENU";
const DEFAULT_BODY = "𝗜𝘁 𝗶𝘀 𝗻𝗼𝘁 𝘆𝗲𝘁 𝘂𝗻𝘁𝗶𝗹 𝗶𝘁 𝗶𝘀 𝗱𝗼𝗻𝗲🗿";

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
 */
function getContextInfo(title = DEFAULT_TITLE, userJid = DEFAULT_PARTICIPANT, thumbnailUrl = DEFAULT_THUMBNAIL_URL) {
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
        title: conf.BOT || 'BELTAH-MD DOWNLOADS',
        body: DEFAULT_BODY,
        thumbnailUrl: thumbnailUrl || conf.URL || '',
        sourceUrl: conf.GURL || 'https://wa.me/254114141192',
      },
    };
  } catch (error) {
    console.error(`Error in getContextInfo: ${error.message}`);
    return {};
  }
}

// Function to upload a file to Catbox and return the URL
async function uploadToCatbox(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist");
    }
    const uploadResult = await catbox.uploadFile({ path: filePath });
    return uploadResult || null;
  } catch (error) {
    console.error('Catbox upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

// YouTube search helper
async function searchYouTube(query) {
  try {
    const searchResults = await ytSearch(query);
    if (!searchResults?.videos?.length) {
      throw new Error('No video found for the specified query.');
    }
    return searchResults.videos[0];
  } catch (error) {
    console.error('YouTube search error:', error);
    throw new Error(`YouTube search failed: ${error.message}`);
  }
}

// Download media from the unified API
async function downloadFromKeithApi(url, type) {
  try {
    const apiUrl = `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl, { timeout: 20000 });
    if (!res.data?.result) throw new Error('No result found from API.');
    if (type === "audio" && !res.data.result.audio) throw new Error('Audio URL not found.');
    if (type === "video" && !res.data.result.video) throw new Error('Video URL not found.');
    return res.data.result;
  } catch (error) {
    throw new Error(`Download failed: ${error.message}`);
  }
}

// Selection table for Audio/Video
function getMediaSelectionTable(title, videoId) {
  return `
╔════════════════════════╗
║        CHOOSE TYPE     ║
╠════════════════════════╣
║ 1️⃣  Audio (MP3)        ║
║ 2️⃣  Video (MP4)        ║
╚════════════════════════╝

Reply with *1* for audio or *2* for video.
Requested: *${title}*
ID: *${videoId.slice(0, 8)}*
  `.trim();
}

// Universal play/video command (table-based selection)
keith({
  nomCom: "play",
  aliases: ["song", "audio", "mp3", "video", "film", "mp4"],
  categorie: "download",
  reaction: "🎵"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, userJid, reply_message, body } = commandOptions;
  try {
    if (!arg[0]) {
      return repondre(zk, dest, ms, "Please provide a song or video name.");
    }

    // Check if user replied with a selection number (1 or 2)
    const userReply = (body || "").trim();
    if ((userReply === "1" || userReply === "2") && reply_message && reply_message.key && reply_message.key.id) {
      // Retrieve context for selection
      const context = zk.mediaSelectionContext || {};
      const videoData = context[reply_message.key.id];
      if (!videoData) return repondre(zk, dest, ms, "Session expired. Please use the command again.");

      const { video, userJid: storedUserJid } = videoData;
      const type = userReply === "1" ? "audio" : "video";
      await zk.sendMessage(dest, {
        text: `BELTAH-MD Downloading ${type === "audio" ? "audio" : "video"}... This may take a moment...`,
        contextInfo: getContextInfo(`Downloading Requested ${type === "audio" ? "Audio" : "Video"}`, storedUserJid, video.thumbnail)
      }, { quoted: fgg });

      // Download from API
      const result = await downloadFromKeithApi(video.url, type);
      const { title, audio, video: videoUrl, thumbnail } = result;

      if (type === "audio") {
        await zk.sendMessage(dest, {
          audio: { url: audio }, mimetype: 'audio/mp4',
          caption: `🎵 *${title}*`,
          contextInfo: getContextInfo(title, storedUserJid, thumbnail || video.thumbnail)
        }, { quoted: ms });
      } else {
        await zk.sendMessage(dest, {
          video: { url: videoUrl }, mimetype: 'video/mp4',
          caption: `🎥 *${title}*`,
          contextInfo: getContextInfo(title, storedUserJid, thumbnail || video.thumbnail)
        }, { quoted: ms });
      }
      // Clean up selection context
      delete zk.mediaSelectionContext[reply_message.key.id];
      return;
    }

    // If not selection, perform search and show table
    const query = arg.join(" ");
    const video = await searchYouTube(query);

    // Save context for next reply
    zk.mediaSelectionContext = zk.mediaSelectionContext || {};
    zk.mediaSelectionContext[ms.key.id] = { video, userJid };

    // Send selection table for user to pick
    await zk.sendMessage(dest, {
      text: getMediaSelectionTable(video.title, video.videoId),
      contextInfo: getContextInfo("Choose Audio or Video", userJid, video.thumbnail)
    }, { quoted: ms });

  } catch (error) {
    console.error('Download error:', error);
    repondre(zk, dest, ms, `Failed: ${error.message}`);
  }
});

// URL upload command
keith({
  nomCom: 'tourl',
  categorie: "download",
  reaction: '👨🏿‍💻'
}, async (dest, zk, commandOptions) => {
  const { msgRepondu, userJid, ms } = commandOptions;
  try {
    if (!msgRepondu) {
      return repondre(zk, dest, ms, "Please mention an image, video, or audio.");
    }

    const mediaTypes = [
      'videoMessage', 'gifMessage', 'stickerMessage',
      'documentMessage', 'imageMessage', 'audioMessage'
    ];

    const mediaType = mediaTypes.find(type => msgRepondu[type]);
    if (!mediaType) {
      return repondre(zk, dest, ms, "Unsupported media type.");
    }

    const mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu[mediaType]);
    const fileUrl = await uploadToCatbox(mediaPath);
    fs.unlinkSync(mediaPath);

    await zk.sendMessage(dest, {
      text: `✅ Here's your file URL:\n${fileUrl} \n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ᴛᴇᴄʜ ᴛᴇᴀᴍ`,
      contextInfo: getContextInfo("Upload Complete", userJid)
    });

  } catch (error) {
    console.error("Upload error:", error);
    repondre(zk, dest, ms, `Upload failed: ${error.message}`);
  }
});
