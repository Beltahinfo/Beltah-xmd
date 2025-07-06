const { keith } = require('../keizzah/keith');
const axios = require('axios');
const fs = require('fs-extra');
const { mediafireDl } = require("../keizzah/dl/Function");
const conf = require(__dirname + "/../set");

// Utility: Context Info for WhatsApp messages
const getContextInfo = (title = '', userJid = '', thumbnailUrl = '', confObj = conf) => ({
  mentionedJid: userJid ? [userJid] : [],
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363249464136503@newsletter",
    newsletterName: "Beltah Tech Info ",
    serverMessageId: Math.floor(100000 + Math.random() * 900000),
  },
  externalAdReply: {
    showAdAttribution: true,
    title: confObj.BOT || 'Beltah-xmd',
    body: title || "YOUR AI ASSISTANT BOT",
    thumbnailUrl: thumbnailUrl || confObj.URL || 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg',
    sourceUrl: confObj.GURL || 'https://wa.me/254114141192',
    mediaType: 1,
    renderLargerThumbnail: false,
  }
});

// APK Downloader
keith({
  nomCom: 'apk',
  aliases: ['app', 'playstore'],
  reaction: '✨',
  categorie: 'Download'
}, async (groupId, client, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  // Check if app name is provided
  const appName = arg.join(" ");
  if (!appName) {
    return repondre("Please provide an app name.");
  }

  try {
    // Fetch app search results from the BK9 API
    const searchResponse = await axios.get(`https://bk9.fun/search/apk?q=${appName}`);
    const searchData = searchResponse.data;

    // Check if any results were found
    if (!searchData.BK9 || searchData.BK9.length === 0) {
      return repondre("No app found with that name, please try again.");
    }

    // Fetch the APK details for the first result
    const appDetailsResponse = await axios.get(`https://bk9.fun/download/apk?id=${searchData.BK9[0].id}`);
    const appDetails = appDetailsResponse.data;

    // Check if download link is available
    if (!appDetails.BK9 || !appDetails.BK9.dllink) {
      return repondre("Unable to find the download link for this app.");
    }

    const thumb = appDetails.BK9.thumbnail || conf.URL; // Fallback to conf.URL if thumbnail is not provided

    // Send the APK file to the group with thumbnail and properly arranged contextInfo
    await client.sendMessage(groupId, {
      document: { url: appDetails.BK9.dllink },
      fileName: `${appDetails.BK9.name}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption: `Downloaded by ${conf.OWNER_NAME}`,
      contextInfo: getContextInfo(
        "𝐁𝐄𝐋𝐓𝐀𝐇 𝐌𝐃 APK Download",
        "",
        thumb,
        {
          ...conf,
          BOT: conf.BOT,
          GURL: 'https://whatsapp.com/channel/0029VaRHDBKKmCPKp9B2uH2F',
          URL: thumb
        }
      )
    }, { quoted: ms });

  } catch (error) {
    // Catch any errors and notify the user
    console.error("Error during APK download process:", error);
    repondre("APK download failed. Please try again later.");
  }
});

// GitHub Clone Downloader
keith({
  nomCom: "gitclone",
  aliases: ["zip", "clone"],
  categorie: "Download"
}, async (dest, zk, context) => {
  const { ms, repondre, arg } = context;
  const githubLink = arg.join(" ");

  // Check if the GitHub link is provided and valid
  if (!githubLink) {
    return repondre("Please provide a valid GitHub link.");
  }

  if (!githubLink.includes("github.com")) {
    return repondre("Is that a GitHub repo link?");
  }

  // Extract owner and repo from the GitHub URL using a regex pattern
  let [, owner, repo] = githubLink.match(/(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i) || [];
  
  // Check if owner and repo were extracted correctly
  if (!owner || !repo) {
    return repondre("Couldn't extract owner and repo from the provided link.");
  }

  // Remove the .git suffix from the repo name if present
  repo = repo.replace(/.git$/, '');

  // GitHub API URL for the zipball of the repo
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/zipball`;

  try {
    // Make a HEAD request to get the file metadata
    const response = await axios.head(apiUrl);
    const fileName = response.headers["content-disposition"].match(/attachment; filename=(.*)/)[1];

    // Send the zip file link as a document with arranged contextInfo
    await zk.sendMessage(dest, {
      document: { url: apiUrl },
      fileName: `${fileName}.zip`,
      mimetype: "application/zip",
      caption: `*Downloaded by ${conf.BOT}*`,
      contextInfo: getContextInfo(
        `${conf.BOT} GIT CLONE`,
        "",
        "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg",
        {
          ...conf,
          BOT: conf.BOT,
          GURL: 'https://whatsapp.com/channel/0029VaRHDBKKmCPKp9B2uH2F',
          URL: "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg"
        }
      )
    }, { quoted: ms });
  } catch (error) {
    // Handle error if the repository cannot be fetched
    console.error(error);
    repondre("Error fetching GitHub repository.");
  }
});
