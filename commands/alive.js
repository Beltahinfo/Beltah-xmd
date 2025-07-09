const { keith } = require("../keizzah/keith");
const os = require("os");
const moment = require("moment-timezone");
const packageJson = require("../package.json");

keith({
  nomCom: "alive",
  categorie: "General",
  reaction: "💡",
  alias: ["test", "bot", "check"],
  description: "Show bot's alive/status message."
}, async (_origineMessage, zk, { ms, repondre }) => {
  const version = packageJson.version || "unknown";
  const author = packageJson.author || "unknown";
  const platform = os.platform();
  const arch = os.arch();
  const memory = (os.totalmem() / (1024 ** 3)).toFixed(2);
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  const time = moment().tz("Africa/Nairobi").format("HH:mm:ss");
  const date = moment().tz("Africa/Nairobi").format("dddd, MMMM Do YYYY");

  const aliveText = 
`🔥 *BELTAH-MD IS ACTIVE!* 🔥

🟢 *Bot Status:* Alive & Working
🤖 *Version:* ${version}
👨‍💻 *Author:* ${author}
💻 *Platform:* ${platform} ${arch}
📦 *RAM:* ${memory} GB
⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s
🕰️ *Time:* ${time}
📅 *Date:* ${date}

💎 *Owner:* wa.me/254114141192
🌐 *GitHub :* https://github.com/Beltah254/BELTAH-MD-BOT

> Powered by Beltah Tech Team 🟢
`;

  // You may add an image or sticker if you like
  await zk.sendMessage(ms.key.remoteJid, { text: aliveText }, { quoted: ms });
});
