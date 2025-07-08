const { keith } = require("../keizzah/keith");
const yts = require('yt-search');
const axios = require('axios');
const conf = require(__dirname + "/../set");
const BASE_URL = 'https://noobs-api.top';

// ContextInfo configuration
const getContextInfo = (title = '', userJid = '', thumbnailUrl = '', sourceUrl = '', conf = {}) => ({
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
    title: conf.BOT || 'Music Downloader',
    body: title || "🟢 Powering Smart Automation 🟢",
    thumbnailUrl: thumbnailUrl || '',
    sourceUrl: sourceUrl || 'https://wa.me/254114141192',
    mediaType: 1,
    renderLargerThumbnail: false,
  }
});

// Helper to fetch metadata and download link
const getSongOrVideo = async (query, format) => {
  const search = await yts(query);
  const video = search.videos[0];
  if (!video) return { error: 'No results found for your query.' };
  const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
  const fileName = `${safeTitle}.${format}`;
  const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=${format}`;
  try {
    const response = await axios.get(apiURL);
    const data = response.data;
    if (!data.downloadLink) return { error: `Failed to retrieve the ${format.toUpperCase()} download link.` };
    return { video, fileName, downloadLink: data.downloadLink };
  } catch (e) {
    return { error: `API error: Unable to fetch download link (${e.message})` };
  }
};

// Unified display formatter
function buildCaption(type, video) {
  const banner = type === "video" ? "BELTAH-MD VIDEO PLAYER" : "BELTAH-MD SONG PLAYER";
  return (
    `*${banner}*\n\n` +
    `╭───────────────◆\n` +
    `│⿻ *Title:* ${video.title}\n` +
    `│⿻ *Duration:* ${video.timestamp}\n` +
    `│⿻ *Views:* ${video.views.toLocaleString()}\n` +
    `│⿻ *Uploaded:* ${video.ago}\n` +
    `│⿻ *Channel:* ${video.author.name}\n` +
    `╰────────────────◆\n\n` +
    `🔗 ${video.url}`
  );
}

// PLAY COMMAND (Audio)
keith({ nomCom: "play", categorie: "Search", reaction: "🎵" }, async (origineMessage, zk, commandeOptions, conf = {}) => {
  const { ms, arg, repondre, nomAuteurMessage } = commandeOptions;
  const query = arg.join(' ');
  if (!query) return repondre("Please provide a song name or keyword.");
  try {
    repondre("Searching Your request, please wait...");
    const res = await getSongOrVideo(query, 'mp3');
    if (res.error) return repondre(res.error);

    const { video, fileName, downloadLink } = res;
    // Send metadata card
    await zk.sendMessage(
      origineMessage,
      {
        image: { url: video.thumbnail },
        caption: buildCaption("audio", video)
      },
      {
        quoted: ms,
        contextInfo: getContextInfo(video.title, ms?.key?.participant || '', video.thumbnail, video.url, conf)
      }
    );
    // Send audio
    await zk.sendMessage(
      origineMessage,
      {
        audio: { url: downloadLink },
        mimetype: 'audio/mpeg',
        fileName,
      },
      {
        quoted: ms,
        contextInfo: getContextInfo(video.title, ms?.key?.participant || '', video.thumbnail, video.url, conf)
      }
    );
  } catch (e) {
    console.error('[PLAY] Error:', e);
    repondre("An error occurred while processing your request.");
  }
});

// SONG COMMAND (Audio as Document)
keith({ nomCom: "song", categorie: "Search", reaction: "🎶" }, async (origineMessage, zk, commandeOptions, conf = {}) => {
  const { ms, arg, repondre, nomAuteurMessage } = commandeOptions;
  const query = arg.join(' ');
  if (!query) return repondre("Please provide a song name or keyword.");
  try {
    repondre("Searching YouTube, please wait...");
    const res = await getSongOrVideo(query, 'mp3');
    if (res.error) return repondre(res.error);

    const { video, fileName, downloadLink } = res;
    // Send metadata card
    await zk.sendMessage(
      origineMessage,
      {
        image: { url: video.thumbnail },
        caption: buildCaption("audio", video)
      },
      {
        quoted: ms,
        contextInfo: getContextInfo(video.title, ms?.key?.participant || '', video.thumbnail, video.url, conf)
      }
    );
    // Send audio as document
    await zk.sendMessage(
      origineMessage,
      {
        document: { url: downloadLink },
        mimetype: 'audio/mpeg',
        fileName,
      },
      {
        quoted: ms,
        contextInfo: getContextInfo(video.title, ms?.key?.participant || '', video.thumbnail, video.url, conf)
      }
    );
  } catch (e) {
    console.error('[SONG] Error:', e);
    repondre("An error occurred while processing your request.");
  }
});

// VIDEO COMMAND (Video as MP4)
keith({ nomCom: "video", categorie: "Search", reaction: "🎬" }, async (origineMessage, zk, commandeOptions, conf = {}) => {
  const { ms, arg, repondre, nomAuteurMessage } = commandeOptions;
  const query = arg.join(' ');
  if (!query) return repondre("Please provide a video name or keyword.");
  try {
    repondre("Searching YouTube, please wait...");
    const res = await getSongOrVideo(query, 'mp4');
    if (res.error) return repondre(res.error);

    const { video, fileName, downloadLink } = res;
    // Send metadata card
    await zk.sendMessage(
      origineMessage,
      {
        image: { url: video.thumbnail },
        caption: buildCaption("video", video)
      },
      {
        quoted: ms,
        contextInfo: getContextInfo(video.title, ms?.key?.participant || '', video.thumbnail, video.url, conf)
      }
    );
    // Send video file
    await zk.sendMessage(
      origineMessage,
      {
        video: { url: downloadLink },
        mimetype: 'video/mp4',
        fileName,
      },
      {
        quoted: ms,
        contextInfo: getContextInfo(video.title, ms?.key?.participant || '', video.thumbnail, video.url, conf)
      }
    );
  } catch (e) {
    console.error('[VIDEO] Error:', e);
    repondre("An error occurred while processing your request.");
  }
});
