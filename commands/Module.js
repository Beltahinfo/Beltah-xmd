const yts = require('yt-search');
const axios = require('axios');
const BASE_URL = 'https://noobs-api.top';

module.exports = {
  name: ['plai', 'songs', 'vidio'],
  tags: ['Search'],
  command: ['plai', 'songs', 'vidio'],
  desc: 'Download songs or videos from YouTube',
  run: async ({ m, args, conn, usedPrefix, command }) => {
    let query = args.join(' ');
    if (!query) return m.reply(`Please provide a song or video name or keyword.`);

    m.reply(`Searching YouTube, please wait...`);
    try {
      const search = await yts(query);
      const video = search.videos[0];
      if (!video) return m.reply('No results found for your query.');

      // Reply with a table of options (buttons)
      const buttons = [
        { buttonId: `${usedPrefix}plai ${query}`, buttonText: { displayText: '🎵 Audio' }, type: 1 },
        { buttonId: `${usedPrefix}songs ${query}`, buttonText: { displayText: '📄 Document (Audio)' }, type: 1 },
        { buttonId: `${usedPrefix}vidio ${query}`, buttonText: { displayText: '🎬 Video' }, type: 1 },
      ];
      const buttonMessage = {
        image: { url: video.thumbnail },
        caption:
          `*Choose format to download:*\n\n` +
          `╭───────────────◆\n` +
          `│⿻ *Title:* ${video.title}\n` +
          `│⿻ *Duration:* ${video.timestamp}\n` +
          `│⿻ *Views:* ${video.views.toLocaleString()}\n` +
          `│⿻ *Uploaded:* ${video.ago}\n` +
          `│⿻ *Channel:* ${video.author.name}\n` +
          `╰────────────────◆\n\n` +
          `🔗 ${video.url}`,
        footer: 'Select your preferred format below!',
        buttons: buttons,
        headerType: 4
      };
      await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
    } catch (error) {
      console.error(`[SONGDL] Error:`, error);
      m.reply('An error occurred while processing your request.');
    }
  }
};
