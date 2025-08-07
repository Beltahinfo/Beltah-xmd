const { keith } = require(__dirname + "/../keizzah/keith");
const settings = require(__dirname + "/../set");
const readMore = String.fromCharCode(8206).repeat(4001);

const DEFAULT_PARTICIPANT = '0@s.whatsapp.net';
const DEFAULT_REMOTE_JID = 'status@broadcast';
const DEFAULT_THUMBNAIL_URL = 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg';
const DEFAULT_TITLE = "BELTAH-MD AI";
const DEFAULT_BODY = "🟢 Powering Smart Automation 🟢";
const DEFAULT_CHANNEL_JID = "120363276287415739@newsletter";
const DEFAULT_CHANNEL_NAME = "Beltah Tech Team 🇰🇪";

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

function getContextInfo(title = DEFAULT_TITLE, userJid = DEFAULT_PARTICIPANT, thumbnailUrl = DEFAULT_THUMBNAIL_URL) {
    return {
        mentionedJid: [userJid],
        channel: {
            jid: DEFAULT_CHANNEL_JID,
            name: DEFAULT_CHANNEL_NAME,
        },
        externalAdReply: {
            showAdAttribution: true,
            title,
            body: DEFAULT_BODY,
            thumbnailUrl,
            sourceUrl: settings.GURL || '',
        },
    };
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

async function reactToMessage(client, msg, emoji = "✅") {
    if (typeof client.sendMessage !== "function") return;
    if (msg && msg.key) {
        try {
            await client.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } });
        } catch (err) {}
    }
}

keith(
    { nomCom: "bel", aliases: ["belli", "bell", "belcmd"], categorie: "SYSTEM" },
    async (message, client, config) => {
        const { ms, respond, prefix, nomAuteurMessage, arg } = config;
        const commands = require(__dirname + "/../keizzah/keith").cm;
        const categorizedCommands = {};

        commands.forEach(command => {
            const category = command.categorie || "OTHER";
            if (!categorizedCommands[category]) categorizedCommands[category] = [];
            categorizedCommands[category].push(command.nomCom);
        });

        const sortedCategories = Object.keys(categorizedCommands).sort();

        let chosenCategoryIndex = null;
        // Accept only replies with a category number (no prefix required)
        if (arg && arg.length > 0) {
            const maybeIndex = parseInt(arg[0]);
            if (!isNaN(maybeIndex) && maybeIndex > 0 && maybeIndex <= sortedCategories.length) {
                chosenCategoryIndex = maybeIndex - 1;
            }
        }

        if (chosenCategoryIndex === null) {
            let menuMessage = `Hello *${nomAuteurMessage || "User"}*\n\n`;
            menuMessage += `*BOT:* ${settings.BOT}\n*OWNER:* ${settings.OWNER_NAME}\n*PREFIX:* [${settings.PREFIXE}]\n*MODE:* ${settings.MODE}\n*UPTIME:* ${formatUptime(process.uptime())}\n\n${readMore}\n`;
            sortedCategories.forEach((cat, i) => {
                menuMessage += `*${i + 1}.* ${cat}\n`;
            });
            menuMessage += `\nReply with the *category number* only (e.g. "2") to see commands in that category.\n`;

            try {
                const senderName = message.sender || message.from;
                await client.sendMessage(
                    message,
                    { text: menuMessage, contextInfo: getContextInfo("BELTAH-MD INFO", senderName, DEFAULT_THUMBNAIL_URL) },
                    { quoted: ms }
                );
            } catch (error) {
                respond("Menu error: " + error);
            }
            return;
        }

        const catName = sortedCategories[chosenCategoryIndex];
        const commandsList = categorizedCommands[catName].sort();

        let categoryMessage = `*Selected: ${catName}*\n*${catName} COMMANDS:*\n`;
        commandsList.forEach(cmd => {
            categoryMessage += `- ${cmd}\n`;
        });
        categoryMessage += `${readMore}`;

        try {
            await reactToMessage(client, message, "✅");
            const senderName = message.sender || message.from;
            await client.sendMessage(
                message,
                { text: categoryMessage, contextInfo: getContextInfo("BELTAH-MD INFO", senderName, DEFAULT_THUMBNAIL_URL) },
                { quoted: ms }
            );
        } catch (error) {
            respond("Menu error: " + error);
        }
    }
);
