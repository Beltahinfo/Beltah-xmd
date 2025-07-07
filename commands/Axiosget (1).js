const { keith } = require('../keizzah/keith');
const axios = require('axios');
const wiki = require('wikipedia');
const conf = require(__dirname + "/../set");
//const { repondre } = require(__dirname + "/../keizzah/context");

// Constants
const DEFAULT_PARTICIPANT = '0@s.whatsapp.net';
const DEFAULT_REMOTE_JID = 'status@broadcast';
const DEFAULT_THUMBNAIL_URL = 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg';
const DEFAULT_TITLE = "Beltah Tech Updates";
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
        sourceUrl: conf.GURL || 'https://wa.me/254114141192',
      },
    };
  } catch (error) {
    console.error(`Error in getContextInfo: ${error.message}`);
    return {}; // Prevent breaking on error
  }
      }

//commands 
keith({
  nomCom: "technews",
  reaction: '📰',
  categorie: 'search'
}, async (dest, zk, context) => {
  const { repondre, ms } = context;

  try {
    // Fetching tech news from the API
    const response = await axios.get("https://fantox001-scrappy-api.vercel.app/technews/random");
    const data = response.data;
    const { thumbnail, news } = data;

    await zk.sendMessage(dest, {
      text: news,
    contextInfo: getContextInfo("BELTAH-MD TECH NEWS", '' , thumbnail)
         }, { quoted: fgg });

  } catch (error) {
    console.error("Error fetching tech news:", error);
    await repondre("Sorry, there was an error retrieving the news. Please try again later.\n" + error);
  }
});

keith({
  nomCom: "bible",
  reaction: '🎎',
  categorie: "search"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;
  const reference = arg.join(" ");
  
  if (!reference) {
    return repondre("Please specify the book, chapter, and verse you want to read. Example: bible john 3:16", {
      contextInfo: getContextInfo("Bible Reference Required", '', "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg")
     }, { quoted: fgg }); 
  }
  
  try {
    const response = await axios.get(`https://bible-api.com/${reference}`);
    
    if (!response.data) {
      return repondre("Invalid reference. Example: bible john 3:16", {
        contextInfo: getContextInfo("Invalid Bible Reference", '', "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg")
      }, { quoted: fgg });
    }
    
    const data = response.data;
    const messageText = `
📖 *${conf.BOT} HOLY SCRIPT* 📖

⧭ *WE'RE READING:* ${data.reference}

⧭ *NUMBER OF VERSES:* ${data.verses.length}

⧭ *NOW READ:* ${data.text}

⧭ *LANGUAGE:* ${data.translation_name}`;
    
    await zk.sendMessage(dest, {
      text: messageText,
      contextInfo: getContextInfo("BELTAH-MD HOLY BIBLE", '', "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg")
    }, { quoted: fgg });
    
  } catch (error) {
    console.error("Error fetching Bible passage:", error);
    await repondre("An error occurred while fetching the Bible passage. Please try again later.", {
      contextInfo: getContextInfo("Error Fetching Bible Passage", '', "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg")
    });
  }
});

keith({
  nomCom: "define",
  aliases: ["dictionary", "dict", "def"],
  reaction: '😁',
  categorie: "Search"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;
  const term = arg.join(" ");

  if (!term) {
    return repondre("BELTAH-MD requires a term to define.");
  }

  try {
    const { data } = await axios.get(`http://api.urbandictionary.com/v0/define?term=${term}`);
    const definition = data.list[0];

    if (definition) {
      const definitionMessage = `
        Word: ${term}
        Definition: ${definition.definition.replace(/\[|\]/g, '')}
        Example: ${definition.example.replace(/\[|\]/g, '')}
      `;

      await zk.sendMessage(dest, {
        text: definitionMessage,
        contextInfo: getContextInfo("BELTAH-MD DICTIONARY", '', "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg")
      }, { quoted: fgg });

    } else {
      return repondre(`No result found for "${term}".`);
    }
  } catch (error) {
    console.error(error);
    return repondre("An error occurred while fetching the definition.");
  }
});

keith({
  nomCom: "pair",
  aliases: ["session", "code", "paircode", "qrcode"],
  reaction: '🖇️',
  categorie: 'system'
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  if (!arg || arg.length === 0) {
    const replyText = "Example Usage: .code 2541111xxxxx.";
    return repondre(replyText);
  }

  try {
    // Notify user that pairing is in progress
    const replyText = "*BELTAH-MD is generating your pairing code ✅...*";
    await repondre(replyText);

    // Prepare the API request
    const encodedNumber = encodeURIComponent(arg.join(" "));
    const apiUrl = `https://bel-tah-md-codes.onrender.com/code?number=${encodedNumber}`;

    // Fetch the pairing code from the API
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data && data.code) {
      const pairingCode = data.code;
      await zk.sendMessage(dest, {
        text: pairingCode,
        contextInfo: getContextInfo("𝗕𝗘𝗟𝗧𝗔𝗛-𝗠𝗗 𝗦𝗘𝗦𝗦𝗜𝗢𝗡𝗦", '', "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg")
      }, { quoted: fgg });

      const secondReplyText = "ʜᴏᴡ ᴛᴏ ʟɪɴᴋ ʙᴇʟᴛᴀʜ-ᴍᴅ ʙᴏᴛ\n\n1. ᴄᴏᴘʏ ᴛʜᴇ ᴀʙᴏᴠᴇ ᴄᴏᴅᴇ ᴛᴏ ʏᴏᴜʀ ᴄʟɪᴘʙᴏᴀʀᴅ 📋\n2. ᴘʀᴇss 3 ᴅᴏᴛs ᴏɴ ᴛʜᴇ ᴜᴘᴘᴇʀ ʀɪɢʜᴛ sɪᴅᴇ ᴏғ ʏᴏᴜʀ ᴡʜᴀᴛsᴀᴘᴘ.\n3. ʟɪɴᴋ ᴀ ᴅᴇᴠɪᴄᴇ.\n4. ʟɪɴᴋ ᴡɪᴛʜ ᴘʜᴏɴᴇ ɴᴜᴍʙᴇʀ.\n5. sɪᴍᴘʟᴇ sᴛᴇᴘ ᴘʀᴇss ᴛʜᴇ ᴀʙᴏᴠᴇ ɴᴏᴛɪғɪᴄᴀᴛɪᴏɴ ᴛᴏ ʟɪɴᴋ ᴛʜᴇ ᴅᴇᴠɪᴄᴇ\n> `ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ᴛᴇᴄʜ ᴛᴇᴀᴍ.`";
      await repondre(secondReplyText);
    } else {
      throw new Error("Invalid response from API.");
    }
  } catch (error) {
    console.error("Error getting API response:", error.message);
    const replyText = "Error getting response from API.";
    repondre(replyText);
  }
});

keith({
  nomCom: "session",
  aliases: ["session", "code", "paircode", "qrcode"],
  reaction: '🖇️',
  categorie: 'system'
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  if (!arg || arg.length === 0) {
    const replyText = "Example Usage: .code 2541111xxxxx.";
    return repondre(replyText);
  }

  try {
    // Notify user that pairing is in progress
    const replyText = "*BELTAH-MD is generating your pairing code ✅...*";
    await repondre(replyText);

    // Prepare the API request
    const encodedNumber = encodeURIComponent(arg.join(" "));
    const apiUrl = `https://beltah-md-sessions.onrender.com/code?number=${encodedNumber}`;

    // Fetch the pairing code from the API
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data && data.code) {
      const pairingCode = data.code;
      await zk.sendMessage(dest, {
        text: pairingCode,
        contextInfo: getContextInfo("𝗕𝗘𝗟𝗧𝗔𝗛-𝗠𝗗 𝗦𝗘𝗦𝗦𝗜𝗢𝗡𝗦", '', "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg")
      }, { quoted: fgg });

      const secondReplyText = "ʜᴏᴡ ᴛᴏ ʟɪɴᴋ ʙᴇʟᴛᴀʜ-ᴍᴅ ʙᴏᴛ\n\n1. ᴄᴏᴘʏ ᴛʜᴇ ᴀʙᴏᴠᴇ ᴄᴏᴅᴇ ᴛᴏ ʏᴏᴜʀ ᴄʟɪᴘʙᴏᴀʀᴅ 📋\n2. ᴘʀᴇss 3 ᴅᴏᴛs ᴏɴ ᴛʜᴇ ᴜᴘᴘᴇʀ ʀɪɢʜᴛ sɪᴅᴇ ᴏғ ʏᴏᴜʀ ᴡʜᴀᴛsᴀᴘᴘ.\n3. ʟɪɴᴋ ᴀ ᴅᴇᴠɪᴄᴇ.\n4. ʟɪɴᴋ ᴡɪᴛʜ ᴘʜᴏɴᴇ ɴᴜᴍʙᴇʀ.\n5. sɪᴍᴘʟᴇ sᴛᴇᴘ ᴘʀᴇss ᴛʜᴇ ᴀʙᴏᴠᴇ ɴᴏᴛɪғɪᴄᴀᴛɪᴏɴ ᴛᴏ ʟɪɴᴋ ᴛʜᴇ ᴅᴇᴠɪᴄᴇ\n> `ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ᴛᴇᴄʜ ᴛᴇᴀᴍ.`";
      await repondre(secondReplyText);
    } else {
      throw new Error("Invalid response from API.");
    }
  } catch (error) {
    console.error("Error getting API response:", error.message);
    const replyText = "Error getting response from API.";
    repondre(replyText);
  }
});

keith({
  nomCom: "element",
  reaction: '📓',
  categorie: "search"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;
  const elementQuery = arg.join(" ").trim();

  if (!elementQuery) {
    return repondre("Please provide an element symbol or name.");
  }

  try {
    const response = await axios.get(`https://api.popcat.xyz/periodic-table?element=${elementQuery}`);
    
    if (!response.data) {
      return repondre("Could not find information for the provided element. Please check the symbol or name.");
    }

    const data = response.data;
    const thumb = data.image; // Assuming the API returns an 'image' property for the element thumbnail

    const formattedMessage = `
*Element Information:*
🚀 *Name:* ${data.name}
🚀 *Symbol:* ${data.symbol}
🚀 *Atomic Number:* ${data.atomic_number}
🚀 *Atomic Mass:* ${data.atomic_mass}
🚀 *Period:* ${data.period}
🚀 *Phase:* ${data.phase}
🚀 *Discovered By:* ${data.discovered_by}
🚀 *Summary:* ${data.summary}
   
Regards ${conf.BOT} `;

    await zk.sendMessage(dest, {
      text: formattedMessage,
      contextInfo: getContextInfo("BELTAH-MD ELEMENT INFORMATION", '', thumb)
    }, { quoted: fgg });

  } catch (error) {
    console.error("Error fetching the element data:", error);
    repondre("An error occurred while fetching the element data. Please try again later.");
  }
});

keith({
  nomCom: "github",
  aliases: ["git"],
  reaction: '💻',
  categorie: "Search"
}, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;
  const githubUsername = arg.join(" ");

  if (!githubUsername) {
    return repondre("Give me a valid GitHub username like: github keithkeizzah");
  }

  try {
    const response = await axios.get(`https://api.github.com/users/${githubUsername}`);
    const data = response.data;

    if (data.message === "Not Found") {
      return repondre(`User ${githubUsername} not found.`);
    }

    const thumb = data.avatar_url; // Using the avatar_url as the thumbnail

    const githubMessage = `
°GITHUB USER INFO°
🚩 Id: ${data.id}
🔖 Name: ${data.name}
🔖 Username: ${data.login}
✨ Bio: ${data.bio}
🏢 Company: ${data.company}
📍 Location: ${data.location}
📧 Email: ${data.email || "Not provided"}
📰 Blog: ${data.blog || "Not provided"}
🔓 Public Repos: ${data.public_repos}
🔐 Public Gists: ${data.public_gists}
👪 Followers: ${data.followers}
🫶 Following: ${data.following}

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ʜᴀᴄᴋɪɴɢ ᴛᴇᴀᴍ`;

    await zk.sendMessage(dest, {
      text: githubMessage,
      contextInfo: getContextInfo("BELTAH-MD GITHUB USER INFO", '', thumb)
    }, { quoted: fgg });

  } catch (error) {
    console.error("Error fetching GitHub user data:", error);
    await repondre("An error occurred while fetching GitHub user data.");
  }
});

keith({
  nomCom: "tempmail",
  aliases: ['mail', 'temp'],
  reaction: '📧',
  categorie: "General"
}, async (dest, zk, context) => {
  const { repondre: replyToUser, prefix, ms: messageQuote } = context;

  try {
    const tempEmail = Math.random().toString(36).substring(2, 14) + "@1secmail.com";

    await zk.sendMessage(dest, {
      text: `Your temporary email is: ${tempEmail}

You can use this email for temporary purposes. I will notify you if you receive any emails.`,
      contextInfo: getContextInfo("Temporary Email Service", '', "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg")
    }, { quoted: messageQuote });

    // Function to check for new emails
    const checkEmails = async () => {
      try {
        const response = await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${tempEmail}&domain=1secmail.com`);
        const emails = response.data;

        if (emails.length > 0) {
          for (const email of emails) {
            const emailDetails = await axios.get(`https://www.1secmail.com/api/v1/?action=readMessage&login=${tempEmail}&domain=1secmail.com&id=${email.id}`);
            const emailData = emailDetails.data;
            const links = emailData.textBody.match(/(https?:\/\/[^\s]+)/g);
            const linksText = links ? links.join("\n") : "No links found in the email content.";

            await zk.sendMessage(dest, {
              text: `You have received a new email!\n\nFrom: ${emailData.from}\nSubject: ${emailData.subject}\n\n${emailData.textBody}\nLinks found:\n${linksText}`,
              contextInfo: getContextInfo("Temporary Email Notification", '', "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg")
            }, { quoted: messageQuote });
          }
        }
      } catch (error) {
        console.error("Error checking temporary email:", error.message);
      }
    };

    // Set an interval to check for new emails every 30 seconds
    const emailCheckInterval = setInterval(checkEmails, 30000);

    // End the email session after 10 minutes
    setTimeout(() => {
      clearInterval(emailCheckInterval);
      zk.sendMessage(dest, {
        text: "Your temporary email session has ended. Please create a new temporary email if needed.",
        contextInfo: getContextInfo("Temporary Email Session Ended", '', "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg")
      }, { quoted: messageQuote });
    }, 600000); // 10 minutes in milliseconds

  } catch (error) {
    console.error("Error generating temporary email:", error.message);
    await zk.sendMessage(dest, {
      text: "Error generating temporary email. Please try again later.",
      contextInfo: getContextInfo("Temporary Email Error", '', conf.URL)
    }, { quoted: messageQuote });
  }
});

keith({
  nomCom: "wiki",
  aliases: ["wikipedia", "wikipeda"],
  reaction: '👻',
  categorie: "search"
}, async (zk, dest, context) => {
  const { repondre, arg, ms } = context;

  // Ensure that the search term is provided
  const text = arg.join(" ").trim(); 

  try {
    if (!text) return repondre(`Provide the term to search,\nE.g What is JavaScript!`);
    
    // Fetch summary from Wikipedia
    const con = await wiki.summary(text);
    
    // Format the reply message
    const texa = `
*📚 Wikipedia Summary 📚*

🔍 *Title*: _${con.title}_

📝 *Description*: _${con.description}_

💬 *Summary*: _${con.extract}_

🔗 *URL*: ${con.content_urls.mobile.page}

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ʜᴀᴄᴋɪɴɢ ᴛᴇᴀᴍ
    `;
    repondre(texa);
  } catch (err) {
    console.error(err);
    repondre(`Got 404. I did not find anything!`);
  }
});
