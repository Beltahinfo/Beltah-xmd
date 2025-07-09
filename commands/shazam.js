const { keith } = require("../keizzah/keith");
const axios = require('axios');
const acrcloud = require("acrcloud");
const { Catbox } = require("node-catbox");
const fs = require('fs-extra');
const yts = require("yt-search");
//const ytdl = require("ytdl-core");
const { sendMessage,repondre } = require(__dirname + "/../keizzah/context");

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
    let result = `🎵 *BELTAH-MD SHAZAM*\n\n` +
      `📌 *Title*: ${title}\n` +
      (artists ? `🎤 *Artists*: ${artists.map(v => v.name).join(', ')}\n` : '') +
      (album ? `💿 *Album*: ${album.name}\n` : '') +
      (release_date ? `📅 *Released*: ${release_date}\n` : '');

    await zk.sendMessage(dest, { 
      text: result, 
      contextInfo: { forwardingScore: 999 } 
    });

  } catch (error) {
    console.error("Shazam Error:", error);
    repondre(zk, dest, ms, `❌ Failed: ${error.message || "Unknown error"}`);
  }
});
