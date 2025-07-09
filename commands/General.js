const { keith } = require("../keizzah/keith");
const axios = require("axios");
const os = require("os");
const moment = require("moment-timezone");
const packageJson = require("../package.json");
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");

keith({
  nomCom: "botinfo",
  categorie: "General",
  reaction: "🤖",
  alias: ["info", "aboutbot"],
  description: "Get information about the bot."
}, async (_origineMessage, zk, { ms, repondre }) => {
  const version = packageJson.version || "unknown";
  const author = packageJson.author || "unknown";
  const nodeVersion = process.version;
  const platform = os.platform();
  const arch = os.arch();
  const memory = (os.totalmem() / (1024 ** 3)).toFixed(2);

  const info = `🤖 *Bot Info*
  • Version: ${version}
  • Author: ${author}
  • Node.js: ${nodeVersion}
  • Platform: ${platform} ${arch}
  • RAM: ${memory} GB
  
> Powered by Beltah Tech`;

  await repondre(info);
});

keith({
  nomCom: "owner",
  categorie: "General",
  reaction: "👑",
  description: "Get owner contact."
}, async (_origineMessage, zk, { ms, repondre }) => {
  await repondre("👑 Bot Owner: wa.me/254114141192");
});

keith({
  nomCom: "time",
  categorie: "General",
  reaction: "🕰️",
  description: "Get the current time."
}, async (_origineMessage, zk, { ms, repondre }) => {
  const time = moment().tz("Africa/Nairobi").format("HH:mm:ss");
  const date = moment().tz("Africa/Nairobi").format("dddd, MMMM Do YYYY");
  await repondre(`🕰️ Time: *${time}*\n📅 Date: *${date}*`);
});

keith({
  nomCom: "github",
  categorie: "General",
  reaction: "🌐",
  description: "Get the bot's GitHub repository."
}, async (_origineMessage, zk, { ms, repondre }) => {
  await repondre("🌐 GitHub: https://github.com/Beltah254/BELTAH-MD");
});

keith({
  nomCom: "support",
  categorie: "General",
  reaction: "🆘",
  description: "Get support group link."
}, async (_origineMessage, zk, { ms, repondre }) => {
  await repondre("🆘 Support Group: https://chat.whatsapp.com/LVvp9x9lPtN0S9RWfwwoWh?mode=r_t");
});
