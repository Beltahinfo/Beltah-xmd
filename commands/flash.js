const { keith } = require("../keizzah/keith");
const axios = require('axios');
const fs = require('fs-extra');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const baileys = require('@whiskeysockets/baileys');
const { Sticker } = require('wa-sticker-formatter');
const { Catbox } = require('node-catbox');
const catbox = new Catbox();

ffmpeg.setFfmpegPath(ffmpegPath);
const { downloadContentFromMessage } = baileys;

const getBuffer = async (mediaMsg, type) => {
  const stream = await downloadContentFromMessage(mediaMsg, type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
};

const uploadToCatbox = async (path) => {
  if (!fs.existsSync(path)) throw new Error("File does not exist");
  const response = await catbox.uploadFile({ path });
  if (!response) throw new Error("Failed to upload");
  return response;
};

const contextInfo = {
  forwardingScore: 1,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363249464136503@newsletter',
    newsletterName: 'Beltah Tech Info',
    serverMessageId: -1
  }
};

// STICKER: image/video to sticker
keith({ nomCom: "bsticker", categorie: "Converter", reaction: "🌟", alias: ["s"] }, async (origineMessage, zk, { ms, arg, repondre }) => {
  const chatId = ms.key.remoteJid;
  const quoted = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imageMsg = ms.message?.imageMessage || quoted?.imageMessage;
  const videoMsg = ms.message?.videoMessage || quoted?.videoMessage;

  try {
    if (imageMsg) {
      const buffer = await getBuffer(imageMsg, 'image');
      const sticker = new Sticker(buffer, {
        pack: 'BELTAH-MD',
        author: ms.pushName || 'User',
        type: arg.includes('crop') ? 'cropped' : 'full',
        quality: 70
      });
      return await zk.sendMessage(chatId, { sticker: await sticker.toBuffer(), contextInfo }, { quoted: ms });

    } else if (videoMsg) {
      const inputPath = `./video_${Date.now()}.mp4`;
      const outputPath = `./sticker_${Date.now()}.webp`;
      const buffer = await getBuffer(videoMsg, 'video');
      await fs.writeFile(inputPath, buffer);

      try {
        await new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .setFfmpegPath(ffmpegPath)
            .outputOptions([
              "-vcodec", "libwebp",
              "-vf", "fps=15,scale=512:512:force_original_aspect_ratio=decrease",
              "-loop", "0",
              "-preset", "default",
              "-an",
              "-vsync", "0"
            ])
            .output(outputPath)
            .on("end", resolve)
            .on("error", reject)
            .run();
        });

        const sticker = new Sticker(await fs.readFile(outputPath), {
          pack: 'BELTAH-MD',
          author: ms.pushName || 'User',
          type: 'full',
          quality: 70
        });

        await zk.sendMessage(chatId, { sticker: await sticker.toBuffer(), contextInfo }, { quoted: ms });

      } catch (err) {
        return await repondre(`FFmpeg error: ${err.message}`);
      } finally {
        if (await fs.pathExists(inputPath)) await fs.unlink(inputPath);
        if (await fs.pathExists(outputPath)) await fs.unlink(outputPath);
      }

    } else {
      return await repondre('Reply to an image or video to make a sticker.');
    }
  } catch (err) {
    return await repondre(`Sticker error: ${err.message}`);
  }
});

// ENHANCE: AI enhance image by URL
keith({ nomCom: "enhance", categorie: "Media", reaction: "🖼️" }, async (origineMessage, zk, { ms, arg, repondre }) => {
  const chatId = ms.key.remoteJid;

  if (!arg.length) return repondre('❗ Please provide the URL of the image you want to enhance.');

  const imageUrl = arg.join(' ');
  const enhanceUrl = `https://bk9.fun/tools/enhance?url=${encodeURIComponent(imageUrl)}`;

  try {
    await zk.sendMessage(chatId, {
      image: { url: enhanceUrl },
      caption: '*Enhanced by BELTAH-MD*',
      contextInfo
    }, { quoted: ms });
  } catch (error) {
    await repondre('⚠️ Failed to enhance the image. Please check the URL and try again.');
  }
});

// QUOTLY: make a quote sticker from text and username
keith({ nomCom: "quotly", categorie: "Converter", reaction: "💬", alias: ["q"] }, async (origineMessage, zk, { ms, arg, repondre }) => {
  const chatId = ms.key.remoteJid;
  const senderName = ms.pushName || 'User';

  if (arg.length < 3 || !arg.includes('by')) {
    return repondre('Use format: .quotly <text> by <username>');
  }

  const byIndex = arg.indexOf('by');
  const text = arg.slice(0, byIndex).join(' ');
  const username = arg.slice(byIndex + 1).join(' ');

  const apiUrl = `https://weeb-api.vercel.app/quotly?pfp=https://files.catbox.moe/c2jdkw.jpg&username=${encodeURIComponent(username)}&text=${encodeURIComponent(text)}`;
  const stickerPath = `./quotly_${Date.now()}.webp`;

  try {
    const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(res.data, 'binary');

    const sticker = new Sticker(buffer, {
      pack: 'BELTAH-MD',
      author: senderName,
      type: 'full',
      quality: 70
    });

    await sticker.toFile(stickerPath);
    await zk.sendMessage(chatId, { sticker: await fs.readFile(stickerPath), contextInfo }, { quoted: ms });
  } catch (err) {
    return repondre(`Error making quotly: ${err.message}`);
  } finally {
    if (await fs.pathExists(stickerPath)) await fs.unlink(stickerPath);
  }
});

// CROP: create cropped sticker
keith({ nomCom: "bcrop", categorie: "Converter", reaction: "✂️" }, async (origineMessage, zk, { ms, arg, repondre }) => {
  const chatId = ms.key.remoteJid;
  const quoted = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const mediaMsg = quoted?.imageMessage || quoted?.videoMessage || quoted?.stickerMessage;

  if (!mediaMsg) return repondre('Reply to an image, video or sticker.');

  const type = quoted?.imageMessage ? 'image' :
               quoted?.videoMessage ? 'video' :
               quoted?.stickerMessage ? 'sticker' : null;
  if (!type) return repondre('Unsupported media type.');

  const buffer = await getBuffer(mediaMsg, type);
  const filePath = `./temp_crop_${Date.now()}`;
  await fs.writeFile(filePath, buffer);

  try {
    const pack = arg.length ? arg.join(' ') : ms.pushName || 'Flash-MD';
    const sticker = new Sticker(buffer, {
      pack,
      author: pack,
      type: 'cropped',
      categories: ["🤩", "🎉"],
      id: "12345",
      quality: 70,
      background: "transparent"
    });

    const stickerBuffer = await sticker.toBuffer();
    await zk.sendMessage(chatId, { sticker: stickerBuffer, contextInfo }, { quoted: ms });

  } finally {
    if (await fs.pathExists(filePath)) await fs.unlink(filePath);
  }
});

// TOMP3: convert video to audio (mp3)
keith({ nomCom: "tomp3", categorie: "Converter", reaction: "🎵", alias: ["toaudio", "audio"] }, async (origineMessage, zk, { ms, repondre }) => {
  const chatId = ms.key.remoteJid;
  const quoted = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const videoMsg = ms.message?.videoMessage || quoted?.videoMessage;

  if (!videoMsg) return repondre('Reply to a video message to convert to MP3.');

  const inputPath = `./video_${Date.now()}.mp4`;
  const outputPath = `./audio_${Date.now()}.mp3`;

  try {
    const buffer = await getBuffer(videoMsg, 'video');
    await fs.writeFile(inputPath, buffer);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setFfmpegPath(ffmpegPath)
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    const audio = await fs.readFile(outputPath);
    await zk.sendMessage(chatId, { audio, mimetype: 'audio/mpeg', contextInfo }, { quoted: ms });

  } catch (err) {
    return repondre(`Error while converting video to MP3: ${err.message}`);
  } finally {
    if (await fs.pathExists(inputPath)) await fs.unlink(inputPath);
    if (await fs.pathExists(outputPath)) await fs.unlink(outputPath);
  }
});

// TAKE: sticker with custom pack name
keith({ nomCom: "btake", categorie: "Converter", reaction: "🏷️" }, async (origineMessage, zk, { ms, arg, repondre }) => {
  const chatId = ms.key.remoteJid;
  const quoted = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const mediaMsg = quoted?.imageMessage || quoted?.videoMessage || quoted?.stickerMessage;

  if (!mediaMsg) return repondre('Reply to an image, video or sticker.');

  const type = quoted?.imageMessage ? 'image' :
               quoted?.videoMessage ? 'video' :
               quoted?.stickerMessage ? 'sticker' : null;
  if (!type) return repondre('Unsupported media type.');

  const buffer = await getBuffer(mediaMsg, type);
  const filePath = `./temp_${Date.now()}`;
  await fs.writeFile(filePath, buffer);

  try {
    const pack = arg.length ? arg.join(' ') : ms.pushName || 'Flash-MD';
    const sticker = new Sticker(buffer, {
      pack,
      type: 'full',
      categories: ["🤩", "🎉"],
      id: "12345",
      quality: 70,
      background: "transparent"
    });

    const stickerBuffer = await sticker.toBuffer();
    await zk.sendMessage(chatId, { sticker: stickerBuffer, contextInfo }, { quoted: ms });

  } finally {
    if (await fs.pathExists(filePath)) await fs.unlink(filePath);
  }
});

// URL: upload media to Catbox and return URL
keith({ nomCom: "tourls", categorie: "Converter", reaction: "🌐" }, async (origineMessage, zk, { ms, repondre }) => {
  const chatId = ms.key.remoteJid;
  const quoted = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const mediaMsg = quoted?.imageMessage || quoted?.videoMessage || quoted?.stickerMessage;

  if (!mediaMsg) return repondre('Reply to an image, video, or sticker to upload.');

  let type = null, ext = null;
  if (quoted?.imageMessage) { type = 'image'; ext = 'jpg'; }
  else if (quoted?.videoMessage) { type = 'video'; ext = 'mp4'; }
  else if (quoted?.stickerMessage) { type = 'sticker'; ext = 'webp'; }

  if (!type || !ext) return repondre('Unsupported media type.');

  const filePath = `./media_${Date.now()}.${ext}`;

  try {
    const buffer = await getBuffer(mediaMsg, type);
    await fs.writeFile(filePath, buffer);

    const url = await uploadToCatbox(filePath);
    await zk.sendMessage(chatId, { text: `Here is your URL:\n${url}`, contextInfo }, { quoted: ms });

  } catch (err) {
    return repondre(`Upload failed: ${err.message}`);
  } finally {
    if (await fs.pathExists(filePath)) await fs.unlink(filePath);
  }
});
