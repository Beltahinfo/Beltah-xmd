// From Menu.js

const axios = require("axios");
const moment = require("moment-timezone");
const os = require('os');
const { keith } = require(__dirname + "/../keizzah/keith");
const settings = require(__dirname + "/../set");
const activeMenus = new Map();

// ========== UTILS ==========

function formatMemory(bytes) {
    if (!bytes) return "0 MB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function formatUptime(seconds) {
    seconds = Number(seconds);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return [
        days > 0 ? `${days}d` : '',
        hours > 0 ? `${hours}h` : '',
        minutes > 0 ? `${minutes}m` : '',
        remainingSeconds > 0 ? `${remainingSeconds}s` : ''
    ].filter(Boolean).join(' ');
}

function toFancyUppercaseFont(text) {
    const fonts = {
        'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌',
        'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙'
    };
    return text.split('').map(char => fonts[char] || char).join('');
}

function getRandomQuote() {
    const quotes = [
        "Dream big, work hard.",
        "Stay humble, hustle hard.",
        "Believe in yourself.",
        "Success is earned, not given.",
        "Actions speak louder than words.",
        "The best is yet to come.",
        "Keep pushing forward.",
        "Do more than just exist.",
        "Progress, not perfection.",
        "Stay positive, work hard.",
        "Be the change you seek.",
        "Never stop learning.",
        "Chase your dreams.",
        "Be your own hero.",
        "Life is what you make of it.",
        "Do it with passion or not at all.",
        "You are stronger than you think."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

// Replace cm logic with static command list per your request:
const categoryCommands = [
    {
        name: "AI",
        commands: ["ɢᴘᴛ", "ɴᴇᴡ𝚜", "𝚜ʜᴀᴢᴀᴍ"]
    },
    {
        name: "AUDIO-EDIT",
        commands: ["ʙᴀ𝚜𝚜", "ʙʟᴏᴡɴ", "ᴅᴇᴇᴘ", "ᴇᴀʀʀᴀᴘᴇ", "ғᴀᴛ", "ɴɪɢʜᴛᴄᴏʀᴇ", "ʀᴇᴠᴇʀ𝚜ᴇ", "ʀᴏʙᴏᴛ", "𝚜ʟᴏᴡ", "𝚜ᴍᴏᴏᴛʜ", "ᴛᴇᴍᴘᴏ", "ᴛᴜᴘᴀɪ"]
    },
    {
        name: "BUG-CMDS",
        commands: ["ᴀᴍᴏᴜɴᴛʙᴜɢ", "ʙᴏᴍʙᴜɢ", "ʙᴜɢ", "ᴄʀᴀ𝚜ʜ", "ᴄʀᴀ𝚜ʜʙᴜɢ", "ᴅᴇʟᴀʏʙᴜɢ", "ᴅᴏᴄᴜʙᴜɢ", "ʟᴀɢʙᴜɢ", "ʟᴏᴄᴄʀᴀ𝚜ʜ", "ᴘᴍʙᴜɢ", "ᴛʀᴏʟʟʏʙᴜɢ", "ᴜɴʟɪᴍɪᴛᴇᴅʙᴜɢ", "🐛"]
    },
    {
        name: "CODING",
        commands: ["ʙᴀ𝚜ᴇ64", "ʙɪɴᴀʀʏ", "ᴄᴀʀʙᴏɴ", "ᴄᴏʟᴏʀ", "ᴅʙɪɴᴀʀʏ", "ᴅᴇʙɪɴᴀʀʏ", "ᴇʙɪɴᴀʀʏ", "ᴇɴᴄ", "ғᴇᴛᴄʜ", "ʀᴜɴ-ᴄ", "ʀᴜɴ-ᴄ++", "ʀᴜɴ-ᴊᴀᴠᴀ", "ʀᴜɴ-ᴊ𝚜", "ʀᴜɴ-ᴘʏ", "𝚜ᴄʀᴀᴘ", "𝚜ʜᴇʟʟ", "ᴛᴇʀᴍɪɴᴀᴛᴇ", "ᴜɴʙᴀ𝚜ᴇ64", "ᴜʀʟᴅᴇᴄᴏᴅᴇ", "ᴜʀʟᴇɴᴄᴏᴅᴇ", "ᴡᴇʙ"]
    },
    {
        name: "CONVERSION",
        commands: ["ᴇᴍᴏᴍɪx", "ᴘʜᴏᴛᴏ", "𝚜ᴄʀᴏᴘ", "𝚜ᴛɪᴄᴋᴇʀ", "ᴛᴀᴋᴇ", "ᴡʀɪᴛᴇ"]
    },
    {
        name: "CONVERTER",
        commands: ["ʙᴄʀᴏᴘ", "ʙ𝚜ᴛɪᴄᴋᴇʀ", "ʙᴛᴀᴋᴇ", "ǫᴜᴏᴛʟʏ", "ᴛᴏᴍᴘ3", "ᴛᴏᴜʀʟ𝚜"]
    },
    {
        name: "DOWNLOAD",
        commands: ["ᴀᴘᴋ", "ᴀᴘᴘᴠɴ", "ᴄᴀᴘᴄᴜᴛ", "ғᴀᴄᴇʙᴏᴏᴋ", "ғᴀᴄᴇʙᴏᴏᴋ2", "ғʙᴅʟ", "ɢɪᴛᴄʟᴏɴᴇ", "ʜᴇɴᴛᴀɪᴠɪᴅ", "ɪɴ𝚜ᴛᴀɢʀᴀᴍ", "ʟɪᴋᴇᴇ", "ᴍᴇᴅɪᴀғɪʀᴇ", "ᴘɪɴᴛᴇʀᴇ𝚜ᴛ", "ᴘᴏʀɴ", "𝚜ᴘᴏᴛɪғʏ", "ᴛɪᴋᴛᴏᴋ", "ᴛɪᴋᴛᴏᴋ2", "ᴛᴡɪᴛᴛᴇʀ"]
    },
    {
        name: "FUN",
        commands: ["ᴀᴅᴠɪᴄᴇ", "ᴀᴍᴏᴜɴᴛǫᴜɪᴢ", "ᴀɴɢʀʏ", "ᴄᴏɪɴғʟɪᴘ", "ᴅᴀʀᴇ", "ᴅɪᴄᴇ", "ᴇᴍᴏᴊɪғʏ", "ғᴀᴄᴛ", "ғᴀɴᴄʏ", "ғʟɪᴘ", "ʜᴀᴄᴋ", "ʜᴀɴᴅ", "ʜᴀᴘᴘʏ", "ʜʀᴛ", "ᴊᴏᴋᴇ", "ᴍᴏᴏɴ", "ɴɪᴋᴀʟ", "ᴘɪᴄᴋ", "ǫᴜᴇ𝚜ᴛɪᴏɴ", "ǫᴜᴏᴛ𝚎𝚜", "ʀᴀɴɪᴍᴇ", "ʀᴀɴᴋ", "𝚜ᴀᴅ", "𝚜ʜʏ", "ᴛᴏᴘʀᴀɴᴋ", "ᴛʀɪᴠɪᴀ", "ᴛʀᴜᴛʜ"]
    },
    {
        name: "GAMES",
        commands: ["ʀɪᴅᴅʟᴇ"]
    },
    {
        name: "GENERAL",
        commands: ["ᴀʟɪᴠᴇ", "ʙᴏᴛɪɴғᴏ", "ʙᴜɢᴍᴇɴᴜ", "ɢɪᴛʜᴜʙ", "ᴏᴡɴᴇʀ", "ʀᴇᴘᴏ", "𝚜ᴜᴘᴘᴏʀᴛ", "ᴛᴇᴍᴘᴍᴀɪʟ", "ᴛɪᴍᴇ", "ᴜʀʟ"]
    },
    {
        name: "GROUP",
        commands: ["ᴀᴅᴅ", "ᴀɴᴛɪʙᴏᴛ", "ᴀɴᴛɪᴅᴇᴍᴏᴛᴇ", "ᴀɴᴛɪʟɪɴᴋ", "ᴀɴᴛɪᴘʀᴏᴍᴏᴛᴇ", "ᴀᴘᴘʀᴏᴠᴇ", "ᴀᴜᴛᴏᴍᴜᴛᴇ", "ᴀᴜᴛᴏᴜɴᴍᴜᴛᴇ", "ʙʀᴏᴀᴅᴄᴀ𝚜ᴛ", "ᴄʟᴏ𝚜ᴇᴛɪᴍᴇ", "ᴄᴏᴍᴘɪʟᴇ", "ᴅᴇʟ", "ᴅᴇᴍᴏᴛᴇ", "ᴅɪ𝚜ᴀᴘ", "ᴅɪ𝚜ᴀᴘ-ᴏғғ", "ᴅɪ𝚜ᴀᴘ1", "ᴅɪ𝚜ᴀᴘ7", "ᴅɪ𝚜ᴀᴘ90", "ғᴋɪᴄᴋ", "ɢᴅᴇ𝚜ᴄ", "ɢɴᴀᴍᴇ", "ɢᴏᴏᴅʙʏᴇ", "ɢᴘᴘ", "ɢʀᴏᴜᴘ", "ɪɴғᴏ", "ɪɴᴠɪᴛᴇ", "ᴋɪᴄᴋᴀʟʟ", "ɴ𝚜ғᴡ", "ᴏɴʟʏᴀᴅᴍɪɴ", "ᴏᴘᴇɴᴛɪᴍᴇ", "ᴘʀᴏᴍᴏᴛᴇ", "ʀᴇᴊᴇᴄᴛ", "ʀᴇᴍᴏᴠᴇ", "ʀᴇǫ", "ᴛᴀɢ", "ᴛᴀɢᴀʟʟ", "ᴠᴄғ", "ᴡᴀʀɴ", "ᴡᴇʟᴄᴏᴍᴇ"]
    },
    {
        name: "HEROKU",
        commands: ["ᴄᴏᴍᴍɪᴛ"]
    },
    {
        name: "HEROKU-CLIENT",
        commands: ["ᴀɪʙᴏᴛ", "ᴀɴᴛɪᴄᴀʟʟ", "ᴀɴᴛɪᴅᴇʟᴇᴛᴇ", "ᴀɴᴛɪᴠᴠ", "ᴀʀᴇᴀᴄᴛ", "ᴄʜᴀᴛʙᴏᴛ", "ᴅᴏᴡɴʟᴏᴀᴅ𝚜ᴛᴀᴛᴜ𝚜", "ɢʀᴇᴇᴛ", "ʟɪᴋᴇ𝚜ᴛᴀᴛᴜ𝚜", "ᴍᴇɴᴜʟɪɴᴋ𝚜", "ᴏɴʟɪɴᴇ", "ᴘᴍ-ᴘᴇʀᴍɪᴛ", "ᴘʀɪᴠᴀᴛᴇᴍᴏᴅᴇ", "ᴘᴜʙʟɪᴄᴍᴏᴅᴇ", "ʀᴇᴀᴅᴍᴇ𝚜𝚜ᴀɢᴇ", "ʀᴇᴀᴅ𝚜ᴛᴀᴛᴜ𝚜", "ʀᴇᴄᴏʀᴅɪɴɢ", "𝚜ᴇᴛᴘʀᴇғɪx", "𝚜ᴇᴛᴛɪɴɢ𝚜", "𝚜ᴛᴀʀᴛᴍᴇ𝚜𝚜ᴀɢᴇ", "ᴛʏᴘɪɴɢ"]
    },
    {
        name: "IMAGE-EDIT",
        commands: ["ᴀғғᴇᴄᴛ", "ʙᴇᴀᴜᴛɪғᴜʟ", "ʙʟᴜʀ", "ᴄɪʀᴄʟᴇ", "ғᴀᴄᴇᴘᴀʟᴍ", "ɢʀᴇʏ𝚜ᴄᴀʟᴇ", "ʜɪᴛʟᴇʀ", "ɪɴᴠᴇʀᴛ", "ᴊᴀɪʟ", "ᴊᴏᴋᴇ", "ʀᴀɪɴʙᴏᴡ", "ʀɪᴘ", "𝚜ᴇᴘɪᴀ", "𝚜ʜɪᴛ", "ᴛʀᴀ𝚜ʜ", "ᴛʀɪɢɢᴇʀ", "ᴡᴀɴᴛᴇᴅ", "ᴡᴀ𝚜ᴛᴇᴅ"]
    },
    {
        name: "IMAGES",
        commands: ["ʙʟᴏᴡᴊᴏʙ", "ʜɴᴇᴋᴏ", "ɪᴍɢ", "ᴍᴇ𝚜𝚜ɪ", "ᴛʀᴀᴘ", "ᴡᴀɪғᴜ"]
    },
    {
        name: "MEDIA",
        commands: ["ᴇɴʜᴀɴᴄᴇ"]
    },
    {
        name: "MODERN-LOGO",
        commands: ["ʟᴏɢᴏ", "ᴠɪᴅᴇᴏʟᴏɢᴏ"]
    },
    {
        name: "MODS",
        commands: ["#", "ʙᴀɴ", "ʙᴀɴɢʀᴏᴜᴘ", "ʙʟᴏᴄᴋ", "ᴄʀᴇᴡ", "ᴊɪᴅ", "ᴊᴏɪɴ", "ʟᴇғᴛ", "ᴍᴇɴᴛɪᴏɴ", "𝚜ᴀᴠᴇ", "𝚜ᴜᴅᴏ", "ᴛɢ𝚜", "ᴜɴʙʟᴏᴄᴋ", "ᴠᴠ"]
    },
    {
        name: "REACTION",
        commands: ["ᴀᴡᴏᴏ", "ʙɪᴛᴇ", "ʙʟᴜ𝚜ʜ", "ʙᴏɴᴋ", "ʙᴜʟʟʏ", "ᴄʀɪɴɢᴇ", "ᴄʀʏ", "ᴄᴜᴅᴅʟᴇ", "ᴅᴀɴᴄᴇ", "ɢʟᴏᴍᴘ", "ʜᴀɴᴅʜᴏʟᴅ", "ʜᴀᴘᴘʏ", "ʜɪɢʜғɪᴠᴇ", "ʜᴜɢ", "ᴋɪᴄᴋ", "ᴋɪʟʟ", "ᴋɪ𝚜𝚜", "ʟɪᴄᴋ", "ɴᴏᴍ", "ᴘᴀᴛ", "ᴘᴏᴋᴇ", "𝚜ʟᴀᴘ", "𝚜ᴍɪʟᴇ", "𝚜ᴍᴜɢ", "ᴡᴀᴠᴇ", "ᴡɪɴᴋ", "ʏᴇᴇᴛ"]
    },
    {
        name: "SEARCH",
        commands: ["ʙɪʙʟᴇ", "ʙʟᴏᴄᴋʟɪ𝚜ᴛ", "ᴅᴇғɪɴᴇ", "ᴇʟᴇᴍᴇɴᴛ", "ғᴏᴏᴛʙᴀʟʟ", "ɢɪᴛʜᴜʙ", "ɢᴏᴏɢʟᴇ", "ʟᴏɢᴏ", "ʟʏʀɪᴄ𝚜", "ᴍᴏᴠɪᴇ", "ᴘʟᴀʏ", "ᴘᴘ", "𝚜ᴏɴɢ", "𝚜ᴛɪᴄᴋᴇʀ𝚜ᴇᴀʀᴄʜ", "ᴛᴇᴄʜɴᴇᴡ𝚜", "ᴛɪᴋᴛᴏᴋ𝚜ᴇᴀʀᴄʜ", "ᴛᴡɪᴛᴛᴇʀ𝚜ᴇᴀʀᴄʜ", "ᴠɪᴅᴇᴏ", "ᴠɪ𝚜ɪᴏɴ", "ᴡɪᴋɪ", "ʏᴛ𝚜", "ʏᴛ𝚜ᴇᴀʀᴄʜ"]
    },
    {
        name: "SOCCER",
        commands: ["ᴄʀɪᴄᴋᴇᴛ"]
    },
    {
        name: "SYSTEM",
        commands: ["ᴀʟʟᴠᴀʀ", "ʙᴇʟ", "ʙxᴅ", "ᴍᴇɴᴜ", "ᴍᴏᴅᴅᴇ", "ᴘᴀɪʀ", "ᴘɪɴɢ", "ʀᴇ𝚜ᴛᴀʀᴛ", "𝚜ᴇ𝚜𝚜ɪᴏɴ", "𝚜ᴇᴛᴠᴀʀ", "ᴛᴇ𝚜ᴛ", "ᴜᴘᴅᴀᴛᴇ", "ᴜᴘᴛɪᴍᴇ"]
    },
    {
        name: "TOOLS",
        commands: ["ᴄᴀʟᴄᴜʟᴀᴛᴇ", "ᴅᴀᴛᴇ", "ᴛɪᴍᴇɴᴏᴡ", "ᴛɪᴍᴇᴢᴏɴᴇ"]
    },
    {
        name: "TTS",
        commands: ["ᴅɪᴛ", "ɪᴛᴛᴀ", "𝚜ᴀʏ"]
    },
    {
        name: "UNIVERSAL",
        commands: ["ᴅᴇ𝚜ᴄ"]
    }
];

// Returns category commands text
function getCategoryCommandsStatic(selectedNumber) {
    const cat = categoryCommands[selectedNumber - 1];
    if (!cat) {
        return { text: "No such category." };
    }
    let text = `*╭─「 ${toFancyUppercaseFont(cat.name)} 」─╮*\n`;
    text += cat.commands.map(cmd => `┃ ◦ ${cmd}`).join("\n");
    text += `\n╰──────────────╯\nReply '0' to go back to main menu.`;
    return { text };
}

// ========== MAIN MENU COMMAND ==========

keith({
    nomCom: "menu",
    categorie: "General"
}, async (dest, zk, commandeOptions) => {
    const { nomAuteurMessage, ms, repondre, auteurMessage } = commandeOptions;
    const userId = auteurMessage;

    try {
        moment.tz.setDefault(settings.TZ || "Africa/Nairobi");

        // Clean up existing session
        if (activeMenus.has(userId)) {
            const { handler } = activeMenus.get(userId);
            zk.ev.off("messages.upsert", handler);
            activeMenus.delete(userId);
        }

        // Dynamic greeting
        const hour = moment().hour();
        let greeting = "🌙 Good Night!";
        if (hour >= 5 && hour < 12) greeting = "🌅 Good Morning!";
        else if (hour >= 12 && hour < 18) greeting = "☀️ Good Afternoon!";
        else if (hour >= 18 && hour < 22) greeting = "🌆 Good Evening!";

        // System info
        const formattedTime = moment().format("h:mm:ss A");
        const formattedDate = moment().format("MMMM Do YYYY");
        const mode = settings.MODE === "public" ? "Public" : "Private";
        const randomQuote = getRandomQuote();
        const totalCommands = categoryCommands.reduce((a, b) => a + b.commands.length, 0);
        const totalMemory = formatMemory(os.totalmem());
        const usedMemory = formatMemory(os.totalmem() - os.freemem());
        const uptime = formatUptime(process.uptime());

        // Main menu message
        const menuMessage = `
*╰► ${toFancyUppercaseFont(greeting)} ${nomAuteurMessage}!*
╭───〔  *${toFancyUppercaseFont(settings.BOT)}* 〕──────┈⊷
| *motivational quote*
> ${randomQuote}
├──────────────
││▸ 𝗣𝗿𝗲𝗳𝗶𝘅: [ ${settings.PREFIXE} ]
││▸ 𝗠𝗼𝗱𝗲: ${mode}
││▸ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀: ${totalCommands}
││▸ 𝗥𝗔𝗠: ${usedMemory}/${totalMemory}
││▸ 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptime}
││▸ 𝗗𝗮𝘁𝗲: ${formattedDate}
││▸ 𝗧𝗶𝗺𝗲: ${formattedTime}
╰──────────────────────⊷

╭───◇ *𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘𝗦* ◇──────⊷
│「 𝗥𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 𝗻𝘂𝗺𝗯𝗲𝗿𝘀 𝗯𝗲𝗹𝗼𝘄 」
${categoryCommands.map((cat, index) => `> │◦➛ ${index + 1}. ${toFancyUppercaseFont(cat.name)}`).join("\n")}
╰─────────────────────┈⊷
`.trim();

        // Send loading reaction
        await zk.sendMessage(dest, { react: { text: '⬇️', key: ms.key } });

        // Send main menu
        const sentMessage = await zk.sendMessage(dest, {
            text: menuMessage,
            contextInfo: {
                mentionedJid: [dest],
                externalAdReply: {
                    title: `${settings.BOT} Menu`,
                    body: `By ${settings.OWNER_NAME}`,
                    thumbnailUrl: settings.URL,
                    sourceUrl: settings.GURL,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: ms });

        // Send completion reaction
        await zk.sendMessage(dest, { react: { text: '✅', key: ms.key } });

        // Handler for user responses
        const replyHandler = async (update) => {
            try {
                const message = update.messages?.[0];
                if (!message?.message?.extendedTextMessage || message.key.remoteJid !== dest) return;

                const response = message.message.extendedTextMessage;
                const isReplyToMenu = response.contextInfo?.stanzaId === sentMessage.key.id;
                const isReplyToCategory = activeMenus.get(userId)?.lastCategoryMessage === message.key.id;

                if (!isReplyToMenu && !isReplyToCategory) return;

                const userInput = response.text.trim();
                const selectedNumber = parseInt(userInput);

                // Send loading reaction for processing
                await zk.sendMessage(dest, { react: { text: '⏳', key: message.key } });

                // Handle back to menu command
                if (userInput === "0") {
                    await zk.sendMessage(dest, { text: menuMessage }, { quoted: message });
                    activeMenus.set(userId, {
                        sentMessage,
                        handler: replyHandler,
                        lastCategoryMessage: null
                    });
                    await zk.sendMessage(dest, { react: { text: '🔙', key: message.key } });
                    return;
                }

                if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > categoryCommands.length) {
                    await repondre(`❌ Invalid number. Please choose between 1-${categoryCommands.length} or "0" to return`);
                    await zk.sendMessage(dest, { react: { text: '⚠️', key: message.key } });
                    return;
                }

                // Get and send category commands
                const { text: commandsText } = getCategoryCommandsStatic(selectedNumber);
                const categoryMessage = await zk.sendMessage(dest, {
                    text: commandsText,
                    contextInfo: {
                        mentionedJid: [dest],
                        externalAdReply: {
                            title: `${categoryCommands[selectedNumber - 1].name} Commands`,
                            body: `Total: ${categoryCommands[selectedNumber - 1].commands.length} commands`,
                            thumbnailUrl: settings.URL,
                            sourceUrl: settings.GURL,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: message });

                await zk.sendMessage(dest, { react: { text: '✅', key: message.key } });

                // Update active session
                activeMenus.set(userId, {
                    sentMessage,
                    handler: replyHandler,
                    lastCategoryMessage: categoryMessage.key.id
                });

            } catch (error) {
                console.error("Menu handler error:", error);
                await zk.sendMessage(dest, { react: { text: '❌', key: ms.key } });
            }
        };

        // Set up listener
        zk.ev.on("messages.upsert", replyHandler);
        activeMenus.set(userId, {
            sentMessage,
            handler: replyHandler,
            lastCategoryMessage: null
        });

        // Auto-cleanup after 10 minutes
        setTimeout(() => {
            if (activeMenus.has(userId)) {
                zk.ev.off("messages.upsert", replyHandler);
                activeMenus.delete(userId);
            }
        }, 600000);

    } catch (error) {
        console.error("Menu command error:", error);
        await repondre("❌ An error occurred while processing the menu command.");
        await zk.sendMessage(dest, { react: { text: '❌', key: ms.key } });
    }
});

// Cleanup on exit
process.on('exit', () => {
    activeMenus.forEach(({ handler }) => {
        zk.ev.off("messages.upsert", handler);
    });
    activeMenus.clear();
});
