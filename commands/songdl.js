const { keith } = require("../keizzah/keith");
const yts = require('yt-search');
const axios = require('axios');
const conf = require(__dirname + "/../set");
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");

const BASE_URL = 'https://noobs-api.top';

// Function to get context info
const getContextInfo = () => ({
  forwardingScore: 999,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363249464136503@newsletter",
    newsletterName: "Beltah Tech Updates",
  },
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
    `╰────────────────◆\n\n` +
    `🔗 ${video.url}`
  );
};

// Command handler function
const commandHandler = async (origineMessage, zk, commandeOptions, type) => {
  const { ms, arg, repondre } = commandeOptions;
  const query = arg.join(' ');
  if (!query) return repondre(`Please provide a ${type} name or keyword.`);

  try {
    repondre(`Searching ${type === 'video' ? 'YouTube' : 'Your request'}, please wait...`);
    const res = await getSongOrVideo(query, type === 'video' ? 'mp4' : 'mp3');
    if (res.error) return repondre(res.error);

    const { video, fileName, downloadLink } = res;
    await zk.sendMessage(
      origineMessage,
      {
        image: { url: video.thumbnail },
        caption: buildCaption(type, video),
      },
      {
        quoted: ms,
        contextInfo: getContextInfo(),
      }
    );

    if (type === 'video') {
      await zk.sendMessage(
        origineMessage,
        {
          video: { url: downloadLink },
          mimetype: 'video/mp4',
          fileName,
        },
        {
          quoted: ms,
          contextInfo: getContextInfo(),
        }
      );
    } else if (type === 'audio' || type === 'song') {
      await zk.sendMessage(
        origineMessage,
        {
          [type === 'song' ? 'document' : 'audio']: { url: downloadLink },
          mimetype: 'audio/mpeg',
          fileName,
        },
        {
          quoted: ms,
          contextInfo: getContextInfo(),
        }
      );
    }
  } catch (error) {
    console.error(`[${type.toUpperCase()}] Error:`, error);
    repondre("An error occurred while processing your request.");
  }
};

// PLAY COMMAND
keith({ nomCom: "play", categorie: "Search", reaction: "🎵" }, async (origineMessage, zk, commandeOptions) => {
  await commandHandler(origineMessage, zk, commandeOptions, 'audio');
});

// SONG COMMAND
keith({ nomCom: "song", categorie: "Search", reaction: "🎶" }, async (origineMessage, zk, commandeOptions) => {
  await commandHandler(origineMessage, zk, commandeOptions, 'song');
});

// VIDEO COMMAND
keith({ nomCom: "video", categorie: "Search", reaction: "🎬" }, async (origineMessage, zk, commandeOptions) => {
  await commandHandler(origineMessage, zk, commandeOptions, 'video');
});
