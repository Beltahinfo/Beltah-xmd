const { keith } = require("../keizzah/keith");
const axios = require("axios");

const BASE_URL = "https://www.noobs-api.rf.gd";

keith({
  nomCom: "alldl",
  categorie: "Downloader",
  reaction: "📥",
  alias: ["alldown", "dl", "download"],
  description: "Download media from various social platforms."
}, async (_origineMessage, zk, { ms, arg, repondre }) => {
  if (!arg || arg.length === 0) {
    return await repondre("🔗 *Please provide a URL to download from.*");
  }

  const url = arg.join(" ");

  try {
    const response = await axios.get(`${BASE_URL}/dipto/alldl?url=${encodeURIComponent(url)}`);
    const data = response.data;

    if (data.result && typeof data.result === "string") {
  const isImage = data.result.endsWith(".jpg") || data.result.endsWith(".png");
  const caption = `*BELTAH-MD*\n🔗 Downloaded from: ${url}`;
  const messageContent = {
    caption,
    contextInfo: {
      externadata.resultlAdReply: {
        title: "BELTAH-MD SO LIT 🔥",
        body: "🟢 Powering Smart Automation 🟢",
        mediaType: 1,
        thumbnailUrl: (typeof data.imageUrl === "string" ? data.imageUrl : "") || "",
        sourceUrl: url,
        renderLargerThumbnail: false,
        showAdAttribution: true
      }
    }
  };

  if (isImage) {
    messageContent.image = { url: data.result };
  } else {
    messageContent.video = { url: data.result };
  }

  await zk.sendMessage(ms.key.remoteJid, messageContent, { quoted: ms });
  await repondre("✅ *Download complete!*");
} else {
  await repondre("❌ No media found or invalid URL.");
}

      await zk.sendMessage(ms.key.remoteJid, messageContent, { quoted: ms });
      await repondre("✅ *Download complete!*");
    } else {
      await repondre("❌ No media found or invalid URL.");
    }
  } catch (error) {
    console.error("[ALLDL ERROR]", error);
    await repondre("⚠️ An error occurred while processing your request.");
  }
});
