const { keith } = require(__dirname + "/../keizzah/keith"); 
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const GEMINI_API_BASE = "https://apis-keith.vercel.app/ai/gemini-vision";

const { Readable } = require('stream');
const FormData = require('form-data');

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
    const { repondre, msgRepondu, arg } = commandeOptions;
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
      await repondre("_Analyzing the image, please wait..._");

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

      await repondre(result);
    } catch (e) {
      if (imageFilePath && fs.existsSync(imageFilePath)) {
        fs.unlinkSync(imageFilePath);
      }
      
      console.error('Vision API Error:', e);
      await repondre(
        `Sorry, I couldn't analyze the image at the moment.\nError: ${e.message}`
      );
    }
  }
);
