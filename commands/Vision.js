
const { keith } = require("../keizzah/keith");
const { uploadtoimgur } = require("../keizzah/imgur"); // Ensure this path and export are correct
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

keith({
  nomCom: "vision",
  aliases: ["analize", "generate"],
  reaction: '👻',
  categorie: "search"
}, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, auteurMessage, arg } = commandeOptions;
  const text = arg.join(" ").trim(); // Get the instruction text

  if (msgRepondu) {
    console.log(msgRepondu);

    // If there is an image message
    if (msgRepondu.imageMessage) {
      try {
        // Provide response asking the user to send the image with an instruction
        if (!text) {
          return repondre("Please provide an instruction with the image.");
        }

        // Acknowledge image receipt and instruction
        await repondre("_A moment, Beltah md is analyzing contents of the image..._");

        // Download and save the image
        const fdr = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);

        // Upload the image to a hosting platform (e.g., Imgur)
        const fta = await uploadtoimgur(fdr);

        // Send request to the Gemini API with the image and instruction
        const genAI = new GoogleGenerativeAI("https://apis-keith.vercel.app/ai/gemini-vision?image=https://i.imgur.com/t5fTpbk.jpeg&q=What%27s%20in%20this%20image");

        // Function to convert URL to generative part
        async function urlToGenerativePart(url, mimeType) {
          const response = await axios.get(url, { responseType: 'arraybuffer' });
          const data = Buffer.from(response.data).toString('base64');

          return { inlineData: { data, mimeType } };
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const imageUrl = fta;
        const image = [await urlToGenerativePart(imageUrl, 'image/jpeg')];

        const result = await model.generateContent([text, ...image]);
        const response = await result.response;
        const resp = response.text();

        await repondre(resp);
      } catch (e) {
        // Handle any errors that occur during image processing
        repondre("I am unable to analyze images at the moment. Error: " + e.message);
      }
    } else {
      // If no image is provided, ask the user to provide an image
      return repondre("Please provide an image to analyze.");
    }
  } else {
    // If no message was received
    return repondre("No image message received. Please send an image.");
  }
});
