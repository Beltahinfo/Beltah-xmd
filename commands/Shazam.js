const { keith } = require("../keizzah/keith");
const axios = require('axios');
const acrcloud = require("acrcloud");
const { Catbox } = require("node-catbox");
const fs = require('fs-extra');
const yts = require("yt-search");
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");

const BASE_URL = 'https://noobs-api.top';
const BOT_NAME = 'BELTAH-MD'; // Change as you want
const NEWSLETTER_JID = '120363295622544409@newsletter';
const NEWSLETTER_NAME = 'Beltah Tech Info🇰🇪';

// Helper to render thumbnail in small display (Markdown style for WhatsApp, using image preview and emoji decorations)
const buildCaption = (type, video) => {
  const bannerEmoji = type === "video" ? "🎬" : "🎶";
  const banner = type === "video" ? `${BOT_NAME} SHAZAM KING` : `${BOT_NAME} SONG FINDER`;
  // Emojis for each field
  return (
    `*${bannerEmoji} ${banner} ${bannerEmoji}*\n\n` +
    `╭───────────────◆\n` +
    `│🖼️ *Thumbnail:*\n` +
    `│        ${video.thumbnail}\n` +
    `│🎵 *Title:* ${video.title}\n` +
    `│⏱️ *Duration:* ${video.timestamp}\n` +
    `│👁️ *Views:* ${video.views.toLocaleString()}\n` +
    `│📅 *Uploaded:* ${video.ago}\n` +
    `│📺 *Channel:* ${video.author.name}\n` +
    `╰────────────────◆\n\n` +
    `🔗 ${video.url}`
  );
};

const getContextInfo = () => ({
  forwardingScore: 1,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: NEWSLETTER_JID,
    newsletterName: NEWSLETTER_NAME,
    serverMessageId: -1
  }
});

const buildDownloadingCaption = () => (
  `*⏬ ${BOT_NAME}* Downloading Shazam result...`
);

// Initialize Catbox
const catbox = new Catbox();

// Initialize ACRCloud
const acr = new acrcloud({
  host: 'identify-ap-southeast-1.acrcloud.com',
  access_key: '26afd4eec96b0f5e5ab16a7e6e05ab37',
  access_secret: 'wXOZIqdMNZmaHJP1YDWVyeQLg579uK2CfY6hWMN8'
});

// Function to upload a file to Catbox
async function uploadToCatbox(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error("File does not exist");
  }
  try {
    const uploadResult = await catbox.uploadFile({ path: filePath });
    return uploadResult;
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

keith({
  nomCom: 'shazam',
  aliases: ['identify', 'findsong'],
  categorie: "Ai",
  reaction: '🎵'
}, async (dest, zk, commandOptions) => {
  const { msgRepondu, ms } = commandOptions;

  try {
    if (!msgRepondu?.audioMessage && !msgRepondu?.videoMessage) {
      return repondre(zk, dest, ms, "❌ Please quote an *audio* or *video* (3+ seconds) to identify the song.");
    }

    const bufferPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage || msgRepondu.videoMessage);
    const buffer = fs.readFileSync(bufferPath);

    const { status, metadata } = await acr.identify(buffer);
    fs.unlinkSync(bufferPath);

    if (status.code !== 0) {
      throw new Error(
        status.code === 3001 ? "No match found. Try with clearer/longer audio." :
        status.code === 3003 ? "Fingerprint generation failed. Audio may be too short/noisy." :
        status.msg
      );
    }

    const { title, artists, album, genres, release_date } = metadata.music[0];
    let searchQuery = title;
    if (artists && artists.length > 0) {
      searchQuery += ' ' + artists.map(v => v.name).join(' ');
    }

    // Search YouTube for the song
    const search = await yts(searchQuery);
    const video = search.videos[0];

    if (!video) {
      return zk.sendMessage(
        dest,
        { text: 'Song identified, but no YouTube match found.', contextInfo: getContextInfo() },
        { quoted: ms }
      );
    }

    const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
    const fileName = `${safeTitle}.mp3`;
    const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp3`;

    // Send caption with thumbnail first (thumbnail shows in WhatsApp preview, and link is displayed in caption)
    await zk.sendMessage(
      dest,
      {
        image: { url: video.thumbnail },
        caption: buildCaption('audio', video),
        contextInfo: getContextInfo()
      },
      { quoted: ms }
    );

    // Send downloading message
    await zk.sendMessage(
      dest,
      {
        text: buildDownloadingCaption(),
        contextInfo: getContextInfo()
      },
      { quoted: ms }
    );

    // Download mp3 link
    const response = await axios.get(apiURL);
    const data = response.data;

    if (!data.downloadLink) {
      return zk.sendMessage(
        dest,
        { text: 'Failed to retrieve the MP3 download link.', contextInfo: getContextInfo() },
        { quoted: ms }
      );
    }

    // Send mp3 audio
    await zk.sendMessage(
      dest,
      {
        audio: { url: data.downloadLink },
        mimetype: 'audio/mpeg',
        fileName
      },
      { quoted: ms }
    );

  } catch (error) {
    console.error("Shazam Error:", error);
    repondre(zk, dest, ms, `❌ Failed: ${error.message || "Unknown error"}`);
  }
});
