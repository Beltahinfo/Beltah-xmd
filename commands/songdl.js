const { keith } = require("../keizzah/keith");
const yts = require('yt-search');
const axios = require('axios');
const BASE_URL = 'https://noobs-api.top';

// ContextInfo configuration
const getContextInfo = (title = '', userJid = '', thumbnailUrl = '', sourceUrl = '') => ({
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
    thumbnailUrl: thumbnailUrl || conf.URL || '',
    sourceUrl: sourceUrl || '',
    mediaType: 1,
    renderLargerThumbnail: false,
  }
});

/*const { keith } = require("../keizzah/keith");
const yts = require('yt-search');
const axios = require('axios');
const BASE_URL = 'https://noobs-api.top';

keith(
  {
    nomCommande: ["play", "song", "video", "ytmp3", "ytmp4"],
    categorie: "Music"
  },
  async (zk, ms, args, origineMessage, conf) => {
    try {
      if (!args[0]) {
        await zk.sendMessage(
          origineMessage,
          { text: 'Please provide a song name or YouTube link.' },
          { quoted: ms, contextInfo: getContextInfo('No input provided', ms?.key?.participant || '', '', '') }
        );
        return;
      }

      const query = args.join(' ');
      let video;

      if (args[0].includes("youtube.com") || args[0].includes("youtu.be")) {
        // Direct YouTube link
        const ytIdMatch = args[0].match(/(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (ytIdMatch) {
          const ytId = ytIdMatch[1];
          const res = await yts({ videoId: ytId });
          video = res;
        } else {
          await zk.sendMessage(
            origineMessage,
            { text: 'Invalid YouTube link.' },
            { quoted: ms, contextInfo: getContextInfo('Invalid YouTube link', ms?.key?.participant || '', '', '') }
          );
          return;
        }
      } else {
        // Search YouTube
        const results = await yts(query);
        if (!results.videos.length) {
          await zk.sendMessage(
            origineMessage,
            { text: 'No results found.' },
            { quoted: ms, contextInfo: getContextInfo('No results found', ms?.key?.participant || '', '', '') }
          );
          return;
        }
        video = results.videos[0];
      }

      // Send video details with thumbnail
      await zk.sendMessage(
        origineMessage,
        {
          image: { url: video.thumbnail },
          caption: `*Title:* ${video.title}\n*Duration:* ${video.timestamp}\n*Views:* ${video.views}\n*Uploaded:* ${video.ago}\n*Channel:* ${video.author.name}\n\n_Choose format:_\n- *${conf.PREFIX}ytmp3* for Audio\n- *${conf.PREFIX}ytmp4* for Video`
        },
        {
          quoted: ms,
          contextInfo: getContextInfo(video.title, ms?.key?.participant || '', video.thumbnail, video.url)
        }
      );

      // Handle format commands
      if (["ytmp3", "song"].includes(ms.body.split(" ")[0].replace(conf.PREFIX, ""))) {
        // Fetch audio
        const res = await axios.get(`${BASE_URL}/api/dl/ytmp3?url=${encodeURIComponent(video.url)}`);
        if (!res.data.status) {
          await zk.sendMessage(
            origineMessage,
            { text: 'Failed to fetch audio.' },
            { quoted: ms, contextInfo: getContextInfo('Failed to fetch audio', ms?.key?.participant || '', video.thumbnail, video.url) }
          );
          return;
        }

        await zk.sendMessage(
          origineMessage,
          {
            document: { url: res.data.result.url },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            caption: `*${video.title}*\n\n🔗 ${video.url}`
          },
          {
            quoted: ms,
            contextInfo: getContextInfo(video.title, ms?.key?.participant || '', video.thumbnail, video.url)
          }
        );
      }

      if (["ytmp4", "video"].includes(ms.body.split(" ")[0].replace(conf.PREFIX, ""))) {
        // Fetch video
        const res = await axios.get(`${BASE_URL}/api/dl/ytmp4?url=${encodeURIComponent(video.url)}`);
        if (!res.data.status) {
          await zk.sendMessage(
            origineMessage,
            { text: 'Failed to fetch video.' },
            { quoted: ms, contextInfo: getContextInfo('Failed to fetch video', ms?.key?.participant || '', video.thumbnail, video.url) }
          );
          return;
        }

        await zk.sendMessage(
          origineMessage,
          {
            video: { url: res.data.result.url },
            mimetype: 'video/mp4',
            fileName: `${video.title}.mp4`,
            caption: `*${video.title}*\n\n🔗 ${video.url}`
          },
          {
            quoted: ms,
            contextInfo: getContextInfo(video.title, ms?.key?.participant || '', video.thumbnail, video.url)
          }
        );
      }
    } catch (err) {
      await zk.sendMessage(
        origineMessage,
        { text: 'An error occurred while processing your request.' },
        { quoted: ms, contextInfo: getContextInfo('Error occurred', ms?.key?.participant || '', '', '') }
      );
    }
  }
);*/

const getSongOrVideo = async (query, format) => {
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
};

// PLAY COMMAND (Audio)
keith({ nomCom: "pplay", categorie: "Search", reaction: "🎵" }, async (origineMessage, zk, commandeOptions) => {
  const { ms, arg, repondre, nomAuteurMessage } = commandeOptions;
  const query = arg.join(' ');
  if (!query) return repondre("Please provide a song name or keyword.");
  try {
    repondre("Searching YouTube, please wait...");
    const res = await getSongOrVideo(query, 'mp3');
    if (res.error) return repondre(res.error);

    const { video, fileName, downloadLink } = res;
    await zk.sendMessage(
      origineMessage,
      {
        image: { url: video.thumbnail },
        caption:
          `*BELTAH-MD SONG PLAYER*\n\n` +
          `╭───────────────◆\n` +
          `│⿻ *Title:* ${video.title}\n` +
          `│⿻ *Duration:* ${video.timestamp}\n` +
          `│⿻ *Views:* ${video.views.toLocaleString()}\n` +
          `│⿻ *Uploaded:* ${video.ago}\n` +
          `│⿻ *Channel:* ${video.author.name}\n` +
          `╰────────────────◆\n\n` +
          `🔗 ${video.url}`,
      },
      { quoted: ms }
    );
    await zk.sendMessage(
      origineMessage,
      {
        audio: { url: downloadLink },
        mimetype: 'audio/mpeg',
        fileName,
      },
      { quoted: ms }
    );
  } catch (e) {
    console.error('[PLAY] Error:', e);
    repondre("An error occurred while processing your request.");
  }
});

// SONG COMMAND (Audio as Document)
keith({ nomCom: "song", categorie: "Search", reaction: "🎶" }, async (origineMessage, zk, commandeOptions) => {
  const { ms, arg, repondre, nomAuteurMessage } = commandeOptions;
  const query = arg.join(' ');
  if (!query) return repondre("Please provide a song name or keyword.");
  try {
    repondre("Searching YouTube, please wait...");
    const res = await getSongOrVideo(query, 'mp3');
    if (res.error) return repondre(res.error);

    const { video, fileName, downloadLink } = res;
    await zk.sendMessage(
      origineMessage,
      {
        image: { url: video.thumbnail },
        caption:
          `*BELTAH-MD SONG PLAYER*\n\n` +
          `╭───────────────◆\n` +
          `│⿻ *Title:* ${video.title}\n` +
          `│⿻ *Duration:* ${video.timestamp}\n` +
          `│⿻ *Views:* ${video.views.toLocaleString()}\n` +
          `│⿻ *Uploaded:* ${video.ago}\n` +
          `│⿻ *Channel:* ${video.author.name}\n` +
          `╰────────────────◆\n\n` +
          `🔗 ${video.url}`,
      },
      { quoted: ms }
    );
    await zk.sendMessage(
      origineMessage,
      {
        document: { url: downloadLink },
        mimetype: 'audio/mpeg',
        fileName,
      },
      { quoted: ms }
    );
  } catch (e) {
    console.error('[SONG] Error:', e);
    repondre("An error occurred while processing your request.");
  }
});

// VIDEO COMMAND (Video as MP4)
keith({ nomCom: "video", categorie: "Search", reaction: "🎬" }, async (origineMessage, zk, commandeOptions) => {
  const { ms, arg, repondre, nomAuteurMessage } = commandeOptions;
  const query = arg.join(' ');
  if (!query) return repondre("Please provide a video name or keyword.");
  try {
    repondre("Searching YouTube, please wait...");
    const res = await getSongOrVideo(query, 'mp4');
    if (res.error) return repondre(res.error);

    const { video, fileName, downloadLink } = res;
    await zk.sendMessage(
      origineMessage,
      {
        image: { url: video.thumbnail },
        caption:
          `*BELTAH-MD VIDEO PLAYER*\n\n` +
          `╭───────────────◆\n` +
          `│⿻ *Title:* ${video.title}\n` +
          `│⿻ *Duration:* ${video.timestamp}\n` +
          `│⿻ *Views:* ${video.views.toLocaleString()}\n` +
          `│⿻ *Uploaded:* ${video.ago}\n` +
          `│⿻ *Channel:* ${video.author.name}\n` +
          `╰────────────────◆\n\n` +
          `🔗 ${video.url}`,
      },
      { quoted: ms }
    );
    await zk.sendMessage(
      origineMessage,
      {
        video: { url: downloadLink },
        mimetype: 'video/mp4',
        fileName,
      },
      { quoted: ms }
    );
  } catch (e) {
    console.error('[VIDEO] Error:', e);
    repondre("An error occurred while processing your request.");
  }
});
