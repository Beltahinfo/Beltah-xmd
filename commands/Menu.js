// From Menu.js

const axios = require("axios");
const moment = require("moment-timezone");
const os = require('os');
const { keith } = require(__dirname + "/../keizzah/keith");
const settings = require(__dirname + "/../set");
const activeMenus = new Map();

const cm = require(__dirname + "/../keizzah/keith").cm;

// ========== UTILS ==========

function initializeCommands() {
    // Here you could reload or update your command list if needed (stub for future use)
}

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

function toFancyLowercaseFont(text) {
    const fonts = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ',
        'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': '𝚜', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.split('').map(char => fonts[char] || char).join('');
}

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

function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

// Command grouping logic
const categoryGroups = {
    "AI": ["AI"],
    "AUDIO EDIT": ["AUDIO-EDIT"],
    "GROUP": ["GROUP"],
    "BUG-CMDS": ["BUG-CMDS"],
    "CODING": ["CODING"],
    "CONVERT CMDS": ["CONVERSATION"],
    "DOWNLOAD": ["DOWNLOAD"],
    "EDITTING": ["EDITTING"],
    "FUN": ["FUN"],
    "GENERAL": ["GENERAL"],
    "IMAGES": ["IMAGES"],
    "MODERN-LOGO": ["MODERN-LOGO"],
    "MODS": ["MODS"],
    "OWNER": ["OWNER"],
    "REACTION": ["REACTION"],
    "SCREENSHOTS": ["SCREENSHOTS"],
    "SEARCH": ["SEARCH"],
    "SPORTS": ["SPORTS"],
    "STALKER": ["STALKER"],
    "SYSTEM": ["SYSTEM"],
    "WA CHANNEL": ["CHANNEL"],
    "TOOLS": ["TOOLS"],
    "TRADE": ["TRADE"],
    "TTS": ["TTS"],
    "UTILITY": ["SEARCH"],
    "SETTINGS": ["SETTING"],
    "HEROKU": ["HEROKU-CLIENT"]
};

// Build command lists by category
const commandList = {};
Object.keys(categoryGroups).forEach(cat => {
    commandList[cat] = cm.filter(c =>
        categoryGroups[cat].some(group => c.categorie && c.categorie.toUpperCase().includes(group))
    ).map(c => c.nomCom);
});

// Returns category commands text
function getCategoryCommands(groups, selectedNumber) {
    const categories = Object.keys(groups);
    const catName = categories[selectedNumber - 1];
    const commands = commandList[catName] || [];

    let text = `*╭─「 ${toFancyUppercaseFont(catName)} COMMANDS 」─╮*\n`;
    if (commands.length) {
        text += commands.map((cmd, idx) => `│ ${idx + 1}. ${toFancyLowercaseFont(cmd)}`).join("\n");
    } else {
        text += "│ No commands found.";
    }
    text += `\n╰─────────────────────┈⊷\nReply '0' to go back to main menu.`;
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
        initializeCommands();
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
        const totalCommands = cm.length;
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
${Object.keys(categoryGroups).map((cat, index) => `> │◦➛ ${index + 1}. ${toFancyUppercaseFont(cat)}`).join("\n")}
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

                const categories = Object.keys(categoryGroups);
                if (selectedNumber < 1 || selectedNumber > categories.length) {
                    await repondre(`❌ Invalid number. Please choose between 1-${categories.length} or "0" to return`);
                    await zk.sendMessage(dest, { react: { text: '⚠️', key: message.key } });
                    return;
                }

                // Get and send category commands
                const { text: commandsText } = getCategoryCommands(categoryGroups, selectedNumber);
                const categoryMessage = await zk.sendMessage(dest, {
                    text: commandsText,
                    contextInfo: {
                        mentionedJid: [dest],
                        externalAdReply: {
                            title: `${categories[selectedNumber - 1]} Commands`,
                            body: `Total: ${commandList[categories[selectedNumber - 1]]?.length || 0} commands`,
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
