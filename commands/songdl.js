const { keith } = require("../keizzah/keith");
const yts = require('yt-search');
const axios = require('axios');
const conf = require(__dirname + "/../set");
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");

const BASE_URL = 'https://noobs-api.top';

// New, dynamic context info function as requested
const getContextInfo1 = (
  title = '',
  userJid = '',
  thumbnailUrl = '',
  confObj = {}
) => ({
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
    body: title || "🟢 Powering Smart Automation 🟢",
    thumbnailUrl: thumbnailUrl || confObj.URL || 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg',
    sourceUrl: confObj.GURL || 'https://wa.me/254114141192',
    mediaType: 1,
    renderLargerThumbnail: false,
  }
});

// Function to get song or video metadata and download link
const getSongOrVideo = async (query, format) => {
  try {
    const search = await yts(query);
    const video = search.videos[0];
    if (!video) return { error: 'No results found for your query.' };

    const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
    const fileName = `${safeTitle}.${format}`;
    const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=${format}`;

    const response = await axios.get(apiURL);
    const data = response.data;
    if (!data.downloadLink) return { error: `Failed to retrieve the ${format.toUpperCase()} download link.` };

    return { video, fileName, downloadLink: data.downloadLink };
  } catch (error) {
    return { error: `API error: Unable to fetch download link (${error.message})` };
  }
};

// Function to build caption
const buildCaption = (type, video) => {
  const banner = type === "video" ? "BELTAH-MD VIDEO PLAYER" : "BELTAH-MD SONG PLAYER";
  return (
    `*${banner}*\n\n` +
    `╭───────────────◆\n` +
    `│⿻ *Title:* ${video.title}\n` +
    `│⿻ *Duration:* ${video.timestamp}\n` +
    `│⿻ *Views:* ${video.views.toLocaleString()}\n` +
    `│⿻ *Uploaded:* ${video.ago}\n` +
    `│⿻ *Channel:* ${video.author.name}\n` +
    `╰────────────────◆\n` +
    `🔗 ${video.url}\n\n` +
    `*Context Info:*\n` +
    `- Newsletter: Beltah Tech Info\n` +
    `- Info: 🟢 Powering Smart Automation 🟢\n` +
    `- Source: https://github.com/Beltah254/BELTAH-MD-BOT`
  );
};

// Command handler function
const commandHandler = async (origineMessage, zk, commandeOptions, type) => {
  const { ms, arg, repondre, sender } = commandeOptions;
  const query = arg.join(' ');
  if (!query) return repondre(`Please provide a ${type} name or keyword.`);

  try {
    repondre(`*${conf.BOT}* DOWNLOADING  ${type === 'video' ? 'YouTube' : 'Your request⬇️'}, please wait...`);
    const res = await getSongOrVideo(query, type === 'video' ? 'mp4' : 'mp3');
    if (res.error) return repondre(res.error);

    const { video, fileName, downloadLink } = res;

    // Always display context info in output
    const contextInfo = getContextInfo1(
      video.title,
      sender || '',
      video.thumbnail,
      conf
    );

    await zk.sendMessage(
      origineMessage,
      {
        image: { url: video.thumbnail },
        caption: buildCaption(type, video),
      },
      {
        quoted: ms,
        contextInfo,
      }
    );

    if (type === 'video') {
      await zk.sendMessage(
        origineMessage,
        {
          video: { url: downloadLink },
          mimetype: 'video/mp4',
          fileName,
          caption: `*Context Info:*\n- Newsletter: Beltah Tech Info\n- Source: https://github.com/Beltah254/BELTAH-MD-BOT`,
        },
        {
          quoted: ms,
          contextInfo,
        }
      );
    } else if (type === 'audio' || type === 'song') {
      await zk.sendMessage(
        origineMessage,
        {
          [type === 'song' ? 'document' : 'audio']: { url: downloadLink },
          mimetype: 'audio/mpeg',
          fileName,
          caption: `*Context Info:*\n- Newsletter: Beltah Tech Info\n- Source: https://github.com/Beltah254/BELTAH-MD-BOT`,
        },
        {
          quoted: ms,
          contextInfo,
        }
      );
    }
  } catch (error) {
    console.error(`[${type.toUpperCase()}] Error:`, error);
    repondre("An error occurred while processing your request.");
  }
};

// PLAY COMMAND
keith(
  { nomCom: "play", categorie: "Search", reaction: "🎵" },
  async (origineMessage, zk, commandeOptions) => {
    await commandHandler(origineMessage, zk, commandeOptions, 'audio');
  }
);

// SONG COMMAND
keith(
  { nomCom: "song", categorie: "Search", reaction: "🎶" },
  async (origineMessage, zk, commandeOptions) => {
    await commandHandler(origineMessage, zk, commandeOptions, 'song');
  }
);

// VIDEO COMMAND
keith(
  { nomCom: "video", categorie: "Search", reaction: "🎬" },
  async (origineMessage, zk, commandeOptions) => {
    await commandHandler(origineMessage, zk, commandeOptions, 'video');
  }
);
