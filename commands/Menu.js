const axios = require("axios");
const { keith } = require(__dirname + "/../keizzah/keith");
const { format } = require(__dirname + "/../keizzah/mesfonctions");
const os = require('os');
const moment = require("moment-timezone");
const settings = require(__dirname + "/../set");

const readMore = String.fromCharCode(8206).repeat(4001);

// Function to convert text to fancy uppercase font
const toFancyUppercaseFont = (text) => {
    const fonts = {
        'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌',
        'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙'
    };
    return text.split('').map(char => fonts[char] || char).join('');
};

// Function to convert text to fancy lowercase font
const toFancyLowercaseFont = (text) => {
    const fonts = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ',
        'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': '𝚜', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.split('').map(char => fonts[char] || char).join('');
};

const formatUptime = (seconds) => {
    seconds = Number(seconds);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return [
        days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : '',
        hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"}` : '',
        minutes > 0 ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}` : '',
        remainingSeconds > 0 ? `${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"}` : ''
    ].filter(Boolean).join(', ');
};

const fetchGitHubStats = async () => {
    try {
        const response = await axios.get("https://api.github.com/repos/Beltah254/X-BOT");
        const forksCount = response.data.forks_count;
        const starsCount = response.data.stargazers_count;
        const totalUsers = forksCount * 2 + starsCount * 2;
        return { forks: forksCount, stars: starsCount, totalUsers };
    } catch (error) {
        console.error("Error fetching GitHub stats:", error);
        return { forks: 0, stars: 0, totalUsers: 0 };
    }
};

// Constants
const DEFAULT_PARTICIPANT = '0@s.whatsapp.net';
const DEFAULT_REMOTE_JID = 'status@broadcast';
const DEFAULT_THUMBNAIL_URL = 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg';
const DEFAULT_TITLE = "BELTAH-MD AI";
const DEFAULT_BODY = "🟢 Powering Smart Automation 🟢";

// Default message configuration
const fgg = {
    key: {
        fromMe: false,
        participant: DEFAULT_PARTICIPANT,
        remoteJid: DEFAULT_REMOTE_JID,
    },
    message: {
        contactMessage: {
            displayName: `Beltah Tech Info`,
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;BELTAH MD;;;\nFN:BELTAH MD\nitem1.TEL;waid=${DEFAULT_PARTICIPANT.split('@')[0]}:${DEFAULT_PARTICIPANT.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
        },
    },
};

/**
 * Construct contextInfo object for messages.
 * @param {string} title - Title for the external ad reply.
 * @param {string} userJid - User JID to mention.
 * @param {string} thumbnailUrl - Thumbnail URL.
 * @returns {object} - ContextInfo object.
 */
function getContextInfo(title = DEFAULT_TITLE, userJid = DEFAULT_PARTICIPANT, thumbnailUrl = DEFAULT_THUMBNAIL_URL) {
    try {
        return {
            mentionedJid: [userJid],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363249464136503@newsletter",
                newsletterName: "Beltah Tech Updates",
                serverMessageId: Math.floor(100000 + Math.random() * 900000),
            },
            externalAdReply: {
                showAdAttribution: true,
                title,
                body: DEFAULT_BODY,
                thumbnailUrl,
                sourceUrl: settings.GURL || '',
            },
        };
    } catch (error) {
        console.error(`Error in getContextInfo: ${error.message}`);
        return {}; // Prevent breaking on error
    }
}

// Random quotes array
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

// Function to get a random quote
const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
};

keith(
    { nomCom: "menu", aliases: ["list", "help", "commands"], categorie: "SYSTEM" },
    async (message, client, config) => {
        const { ms, respond, prefix, nomAuteurMessage } = config;
        const commands = require(__dirname + "/../keizzah/keith").cm;
        const categorizedCommands = {};
        const mode = settings.MODE.toLowerCase() !== "public" ? "Private" : "Public";

        // Organize commands into categories
        commands.forEach(command => {
            const category = command.categorie.toUpperCase();
            if (!categorizedCommands[category]) {
                categorizedCommands[category] = [];
            }
            categorizedCommands[category].push(command.nomCom);
        });

        moment.tz.setDefault("Africa/Nairobi");
        const currentTime = moment();
        const formattedTime = currentTime.format("HH:mm:ss");
        const formattedDate = currentTime.format("DD/MM/YYYY");
        const currentHour = currentTime.hour();

        const greetings = [
            "Time to own the system 🌄",
            "Stay vigilant, stay sharp 🌃",
            "Keep your exploits ready ⛅",
            "The darknet never sleeps 🌙"
        ];
        const greeting = currentHour < 12 ? greetings[0] : currentHour < 17 ? greetings[1] : currentHour < 21 ? greetings[2] : greetings[3];

        const { totalUsers } = await fetchGitHubStats();
        const formattedTotalUsers = totalUsers.toLocaleString();

        const randomQuote = getRandomQuote();

        let responseMessage = `Hello 👋   *${nomAuteurMessage || "User"}*
        
╭───「 *${settings.BOT}* 」───╮ 
┃◦ *ᴏᴡɴᴇʀ:* ${settings.OWNER_NAME}
┃◦ *ᴘʀᴇғɪx:* *[ ${settings.PREFIXE} ]*
┃◦ *ᴛɪᴍᴇ:* ${formattedTime}
┃◦ *ᴅᴀᴛᴇ:* ${formattedDate}
┃◦ *ᴍᴏᴅᴇ:* ${mode} 
┃◦ *ɢʀᴇᴇᴛɪɴɢ :*  ${greeting}
┃◦ *ᴀʟɪᴠᴇ:* ${formatUptime(process.uptime())}
╰──────────────────╯ 
> ©ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ᴛᴇᴄʜ ʜᴜʙ
\n${readMore}`;

        let commandsList = "\n🛡️ *COMMAND CATEGORIES:* 🛡️\n";
        const sortedCategories = Object.keys(categorizedCommands).sort();

        for (const category of sortedCategories) {
            commandsList += `\n╭───「 ${toFancyUppercaseFont(category)} 」───╮\n`;
            const sortedCommands = categorizedCommands[category].sort();
            for (const command of sortedCommands) {
                commandsList += `┃ ◦ ${toFancyLowercaseFont(command)}\n`;
            }
            commandsList += "╰──────────────╯\n";
        }

        commandsList += `${readMore}\n> 🔐 *𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐁𝐄𝐋𝐓𝐀𝐇 𝐓𝐄𝐂𝐇 𝐓𝐄𝐀𝐌 ©𝟐𝟎𝟐𝟓* 🔐\n`;
        try {
            const senderName = message.sender || message.from;
            await client.sendMessage(
                message,
                {
                    text: responseMessage + commandsList,
                    contextInfo: getContextInfo("BELTAH-MD INFO", senderName, 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg')
                },
                { quoted: ms }
            );
        } catch (error) {
            console.error("Menu error: ", error);
            respond("🥵🥵 Menu error: " + error);
        }
    }
);
