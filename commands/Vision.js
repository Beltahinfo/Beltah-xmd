// Vision.js: Gemini Vision API integration for image analysis.
// Cleans up code, improves error handling, and updates command triggers.

const { keith } = require("../keizzah/keith");
const { uploadtoimgur } = require("../keizzah/imgurr");
const axios = require("axios");

// Configure your Gemini Vision API endpoint here.
const GEMINI_API_BASE = "https://apis-keith.vercel.app/ai/gemini-vision";

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

    // Must reply to an image message
    if (!msgRepondu || !msgRepondu.imageMessage) {
      return repondre(
        "Please reply to an image message with your instruction (e.g., analyze, describe, or ask a question about the image)."
      );
    }

    if (!instruction) {
      return repondre("Please provide an instruction or question for the image (e.g., 'Describe this image', 'What is happening here?', etc).");
    }

    try {
      await repondre("_Analyzing the image, please wait..._");

      // Download and upload image
      const imageFilePath = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
      const imageUrl = await uploadtoimgur(imageFilePath);

      // Call Gemini Vision API
      const apiUrl = `${GEMINI_API_BASE}?image=${encodeURIComponent(imageUrl)}&q=${encodeURIComponent(instruction)}`;
      const response = await axios.get(apiUrl);

      // Prefer 'result' field; fallback to full object or text
      let result;
      if (typeof response.data === "object" && response.data !== null) {
        result = response.data.result || response.data.answer || JSON.stringify(response.data, null, 2);
      } else {
        result = response.data;
      }

      await repondre(result);
    } catch (e) {
      await repondre(
        `Sorry, I couldn't analyze the image at the moment.\nError: ${e.message}`
      );
    }
  }
);
