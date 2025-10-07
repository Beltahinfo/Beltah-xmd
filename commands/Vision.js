const { keith } = require(__dirname + "/../keizzah/keith"); 
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const GEMINI_API_BASE = "https://apis-keith.vercel.app/ai/gemini-vision";

const { Readable } = require('stream');
const FormData = require('form-data');

// Common contextInfo configuration
const getContextInfo = (title = '', userJid = '', thumbnailUrl = '') => ({
  mentionedJid: userJid ? [userJid] : [],
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363249464136503@newsletter",
    newsletterName: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ᴛᴇᴄʜ",
    serverMessageId: Math.floor(100000 + Math.random() * 900000),
  },
  externalAdReply: {
    showAdAttribution: true,
    title: title || "BELTAH-MD",
    body: "🙌It's not yet until it's done 🙌",
    thumbnailUrl: thumbnailUrl || 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg',
    sourceUrl: (typeof settings !== "undefined" && settings.GURL) ? settings.GURL : '',
    mediaType: 1,
    renderLargerThumbnail: false
  }
});

function bufferToStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

function getFileContentType(extension) {
    const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp'
    };
    return contentTypes[extension.toLowerCase()] || 'image/jpeg';
}

async function uploadToGithubCdn(buffer, filename) {
    try {
        const form = new FormData();
        const stream = bufferToStream(buffer);
        
        form.append('file', stream, {
            filename: filename,
            contentType: getFileContentType(path.extname(filename))
        });

        const { data } = await axios.post('https://ghbcdn.giftedtech.co.ke/api/upload.php', form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 30000
        });

        return { url: data.rawUrl || data.url || data };
    } catch (error) {
        throw new Error(`GitHub CDN upload failed: ${error.message}`);
    }
}

keith(
  {
    nomCom: "vision",
    aliases: ["analyze", "aibeltah"],
    reaction: "👻",
    categorie: "search",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, msgRepondu, arg, sender } = commandeOptions;
    const instruction = arg.join(" ").trim();

    if (!msgRepondu || !msgRepondu.imageMessage) {
      return repondre(
        "Please reply to an image message with your instruction (e.g., analyze, describe, or ask a question about the image)."
      );
    }

    if (!instruction) {
      return repondre("Please provide an instruction or question for the image (e.g., 'Describe this image', 'What is happening here?', etc).");
    }

    let imageFilePath;
    
    try {
      await repondre("_BELTAH-MD analyzing the image, please wait..._");

      imageFilePath = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
      
      const imageBuffer = fs.readFileSync(imageFilePath);
      const filename = `vision_${Date.now()}${path.extname(imageFilePath) || '.jpg'}`;
      
      const uploadResult = await uploadToGithubCdn(imageBuffer, filename);
      const imageUrl = uploadResult.url;

      if (!imageUrl) {
        throw new Error('Failed to get image URL from GitHub CDN');
      }

      const apiUrl = `${GEMINI_API_BASE}?image=${encodeURIComponent(imageUrl)}&q=${encodeURIComponent(instruction)}`;
      const response = await axios.get(apiUrl, { timeout: 30000 });


      let result;
      if (typeof response.data === "object" && response.data !== null) {
        result = response.data.result || response.data.answer || response.data.response || JSON.stringify(response.data, null, 2);
      } else {
        result = response.data;
      }

      if (imageFilePath && fs.existsSync(imageFilePath)) {
        fs.unlinkSync(imageFilePath);
      }

      // Send result with contextInfo for externalAdReply
      await repondre(result, {
        contextInfo: getContextInfo(
          "𝗕𝗘𝗟𝗧𝗔𝗛 𝗩𝗜𝗦𝗜𝗢𝗡 👁️",
          sender,
          imageUrl // Use analyzed image as thumbnail
        )
      });

    } catch (e) {
      if (imageFilePath && fs.existsSync(imageFilePath)) {
        fs.unlinkSync(imageFilePath);
      }
      
      console.error('Vision API Error:', e);
      await repondre(
        `Sorry, I couldn't analyze the image at the moment.\nError: ${e.message}`,
        {
          contextInfo: getContextInfo(
            "𝗕𝗘𝗟𝗧𝗔𝗛 𝗩𝗜𝗦𝗜𝗢𝗡 👁️",
            (commandeOptions && commandeOptions.sender) ? commandeOptions.sender : '',
            'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg'
          )
        }
      );
    }
  }
);
 
