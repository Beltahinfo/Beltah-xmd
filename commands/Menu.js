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
        commands: ["ʙᴀ𝚜𝚜", "ʙʟᴏᴡɴ", "ᴅᴇᴇᴘ", "ᴇᴀʀʀᴀᴘᴇ", "ғᴀᴛ", "ɴɪɢʜᴛᴄᴏʀᴇ", "ʀᴇᴠᴇʀ𝚜ᴇ", "ʀᴏʙᴏᴛ", "𝚜ʟᴏᴡ", "𝚜ᴍᴏᴏ[...]
    },
    {
        name: "BUG-CMDS",
        commands: ["ᴀᴍᴏᴜɴᴛʙᴜɢ", "ʙᴏᴍʙᴜɢ", "ʙᴜɢ", "ᴄʀᴀ𝚜ʜ", "ᴄʀᴀ𝚜ʜʙᴜɢ", "ᴅᴇʟᴀʏʙᴜɢ", "ᴅᴏᴄᴜʙᴜɢ", "ʟᴀɢʙᴜɢ", "ʟᴏᴄᴄʀ�[...]
    },
    {
        name: "CODING",
        commands: ["ʙᴀ𝚜ᴇ64", "ʙɪɴᴀʀʏ", "ᴄᴀʀʙᴏɴ", "ᴄᴏʟᴏʀ", "ᴅʙɪɴᴀʀʏ", "ᴅᴇʙɪɴᴀʀʏ", "ᴇʙɪɴᴀʀʏ", "ᴇɴᴄ", "ғᴇᴛᴄʜ", "ʀᴜɴ-ᴄ", "ʀ[...]
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
        commands: ["ᴀᴘᴋ", "ᴀᴘᴘᴠɴ", "ᴄᴀᴘᴄᴜᴛ", "ғᴀᴄᴇʙᴏᴏᴋ", "ғᴀᴄᴇʙᴏᴏᴋ2", "ғʙᴅʟ", "ɢɪᴛᴄʟᴏɴᴇ", "ʜᴇɴᴛᴀɪᴠɪᴅ", "ɪɴ𝚜��[...]
    },
    {
        name: "FUN",
        commands: ["ᴀᴅᴠɪᴄᴇ", "ᴀᴍᴏᴜɴᴛǫᴜɪᴢ", "ᴀɴɢʀʏ", "ᴄᴏɪɴғʟɪᴘ", "ᴅᴀʀᴇ", "ᴅɪᴄᴇ", "ᴇᴍᴏᴊɪғʏ", "ғᴀᴄᴛ", "ғᴀɴᴄʏ", "ғʟɪ�[...]
    },
    {
        name: "GAMES",
        commands: ["ʀɪᴅᴅʟᴇ"]
    },
    {
        name: "GENERAL",
        commands: ["ᴀʟɪᴠᴇ", "ʙᴏᴛɪɴғᴏ", "ʙᴜɢᴍᴇɴᴜ", "ɢɪᴛʜᴜʙ", "ᴏᴡɴᴇʀ", "ʀᴇᴘᴏ", "𝚜ᴜᴘᴘᴏʀᴛ", "ᴛᴇᴍᴘᴍᴀɪʟ", "ᴛɪᴍᴇ", "ᴜ�[...]
    },
    {
        name: "GROUP",
        commands: ["ᴀᴅᴅ", "ᴀɴᴛɪʙᴏᴛ", "ᴀɴᴛɪᴅᴇᴍᴏᴛᴇ", "ᴀɴᴛɪʟɪɴᴋ", "ᴀɴᴛɪᴘʀᴏᴍᴏᴛᴇ", "ᴀᴘᴘʀᴏᴠᴇ", "ᴀᴜᴛᴏᴍᴜᴛᴇ", "ᴀ�[...]
    },
    {
        name: "HEROKU",
        commands: ["ᴄᴏᴍᴍɪᴛ"]
    },
    {
        name: "HEROKU-CLIENT",
        commands: ["ᴀɪʙᴏᴛ", "ᴀɴᴛɪᴄᴀʟʟ", "ᴀɴᴛɪᴅᴇʟᴇᴛᴇ", "ᴀɴᴛɪᴠᴠ", "ᴀʀᴇᴀᴄᴛ", "ᴄʜᴀᴛʙᴏᴛ", "ᴅᴏᴡɴʟᴏᴀᴅ𝚜ᴛᴀᴛᴜ𝚜",[...]
    },
    {
        name: "IMAGE-EDIT",
        commands: ["ᴀғғᴇᴄᴛ", "ʙᴇᴀᴜᴛɪғᴜʟ", "ʙʟᴜʀ", "ᴄɪʀᴄʟᴇ", "ғᴀᴄᴇᴘᴀʟᴍ", "ɢʀᴇʏ𝚜ᴄᴀʟᴇ", "ʜɪᴛʟᴇʀ", "ɪɴᴠᴇʀᴛ", "ᴊᴀɪʟ[...]
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
        commands: ["#", "ʙᴀɴ", "ʙᴀɴɢʀᴏᴜᴘ", "ʙʟᴏᴄᴋ", "ᴄʀᴇᴡ", "ᴊɪᴅ", "ᴊᴏɪɴ", "ʟᴇғᴛ", "ᴍᴇɴᴛɪᴏɴ", "𝚜ᴀᴠᴇ", "𝚜ᴜᴅᴏ", "ᴛɢ𝚜", [...]
    },
    {
        name: "REACTION",
        commands: ["ᴀᴡᴏᴏ", "ʙɪᴛᴇ", "ʙʟᴜ𝚜ʜ", "ʙᴏɴᴋ", "ʙᴜʟʟʏ", "ᴄʀɪɴɢᴇ", "ᴄʀʏ", "ᴄᴜᴅᴅʟᴇ", "ᴅᴀɴᴄᴇ", "ɢʟᴏᴍᴘ", "ʜᴀɴᴅʜᴏʟ��[...]
    },
    {
        name: "SEARCH",
        commands: ["ʙɪʙʟᴇ", "ʙʟᴏᴄᴋʟɪ𝚜ᴛ", "ᴅᴇғɪɴᴇ", "ᴇʟᴇᴍᴇɴᴛ", "ғᴏᴏᴛʙᴀʟʟ", "ɢɪᴛʜᴜʙ", "ɢᴏᴏɢʟᴇ", "ʟᴏɢᴏ", "ʟʏʀɪᴄ𝚜", "�[...]
    },
    {
        name: "SOCCER",
        commands: ["ᴄʀɪᴄᴋᴇᴛ"]
    },
    {
        name: "SYSTEM",
        commands: ["ᴀʟʟᴠᴀʀ", "ʙᴇʟ", "ʙxᴅ", "ᴍᴇɴᴜ", "ᴍᴏᴅᴅᴇ", "ᴘᴀɪʀ", "ᴘɪɴɢ", "ʀᴇ𝚜ᴛᴀʀᴛ", "𝚜ᴇ𝚜𝚜ɪᴏɴ", "𝚜ᴇ𝚝ᴠᴀʀ", "ᴛᴇ�[...]
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
    text += `\n╰──────────────╯\nReply '${settings.PREFIXE} menu' to go back to main menu.`;
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
┏──〘*${toFancyUppercaseFont(settings.BOT)}* 〙───⊷
┃▸ 𝗣𝗿𝗲𝗳𝗶𝘅: [ ${settings.PREFIXE} ]
┃▸ 𝗠𝗼𝗱𝗲: ${mode}
┃▸ 𝗖𝗺𝗱𝘀: ${totalCommands}
┃▸ 𝗥𝗔𝗠: ${totalMemory}
┃▸ 𝗧𝗶𝗺𝗲: ${formattedTime}
┃▸ 𝗗𝗮𝘁𝗲: ${formattedDate}
┃▸ 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptime}
┗──────────────⊷

©ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ᴛᴇᴄʜ/n${readmore} 
┏──◇ *𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘𝗦* ◇───⊷
┃「 𝗥𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 𝗻𝘂𝗺𝗯𝗲𝗿𝘀 𝗯𝗲𝗹𝗼𝘄 」
${categoryCommands.map((cat, index) => `> │◦➛ ${index + 1}. ${toFancyUppercaseFont(cat.name)}`).join("\n")}
┗─────────────────⊷
`.trim();

        // Send loading reaction
        await zk.sendMessage(dest, { react: { text: '⬇️', key: ms.key } });

        // Send main menu
        const sentMessage = await zk.sendMessage(dest, {
            text: menuMessage,
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363276287415739@newsletter",
                newsletterName: "BELTAH-MD BOT",
                serverMessageId: Math.floor(100000 + Math.random() * 900000),
            },
            contextInfo: {
                mentionedJid: [dest],
                externalAdReply: {
                    title: `${settings.BOT} Menu`,
                    body: `${randomQuote}`,
                    thumbnailUrl: settings.URL,
                    sourceUrl: settings.GURL,
                    mediaType: 1,
                    renderLargerThumbnail: false, // Use smallrender (thumbnail) image
                    showAdAttribution: true
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
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363276287415739@newsletter",
                        newsletterName: "BELTAH-MD BOT",
                        serverMessageId: Math.floor(100000 + Math.random() * 900000),
                    },
                    contextInfo: {
                        mentionedJid: [dest],
                        externalAdReply: {
                            title: `${categoryCommands[selectedNumber - 1].name} Commands`,
                            body: `Total: ${categoryCommands[selectedNumber - 1].commands.length} commands`,
                            thumbnailUrl: settings.URL,
                            sourceUrl: settings.GURL,
                            mediaType: 1,
                            renderLargerThumbnail: false, // Use smallrender (thumbnail) image
                            showAdAttribution: true
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
