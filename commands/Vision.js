// Improved and fixed Vision.js to use the provided IP for Gemini API requests and ensure the command works as expected.

const { keith } = require("../keizzah/keith");
const { uploadtoimgur } = require("../keizzah/imgur");
const axios = require("axios");

// Replace this with your provided Gemini API IP (example given below)
const GEMINI_API_BASE = "https://apis-keith.vercel.app/ai/gemini-vision";

keith(
  {
    nomCom: "vision",
    aliases: ["analize", "generate"],
    reaction: "👻",
    categorie: "search",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, msgRepondu, arg } = commandeOptions;
    const text = arg.join(" ").trim();

    if (!msgRepondu) {
      return repondre("No image message received. Please send an image.");
    }

    if (!msgRepondu.imageMessage) {
      return repondre("Please provide an image to analyze.");
    }

    if (!text) {
      return repondre("Please provide an instruction with the image.");
    }

    try {
      await repondre(
        "_A moment, Beltah md is analyzing contents of the image..._"
      );

      // Download and save the image
      const fdr = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);

      // Upload the image to Imgur (or your own image server)
      const imageUrl = await uploadtoimgur(fdr);

      // Call the Gemini API using the provided IP, passing the image URL and the instruction
      // Ensure the API at the provided IP supports the same query parameters
      const apiUrl = `${GEMINI_API_BASE}?image=${encodeURIComponent(
        imageUrl
      )}&q=${encodeURIComponent(text)}`;

      const response = await axios.get(apiUrl);

      // Assume the response contains the result text in 'data.result' or just 'data'
      const resp =
        typeof response.data === "object"
          ? response.data.result || JSON.stringify(response.data)
          : response.data;

      await repondre(resp);
    } catch (e) {
      repondre(
        "I am unable to analyze images at the moment. Error: " + e.message
      );
    }
  }
);
