
const { keith } = require('../keizzah/keith');
const axios = require('axios');
const fs = require('fs-extra');
const { mediafireDl } = require("../keizzah/dl/Function");
const { igdl } = require("ruhend-scraper");
const getFBInfo = require("@xaviabot/fb-downloader");
const { downloadTiktok } = require('@mrnima/tiktok-downloader');
const { facebook } = require('@mrnima/facebook-downloader');  
const conf = require(__dirname + "/../set");

keith({
  nomCom: "twitter",
  aliases: ["xdl", "tweet"],
  desc: "to download Twitter",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a Twitter video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/twitter?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9.HD) {
      const videoUrl = response.data.BK9.HD;
      const username = response.data.BK9.username;
      const caption = response.data.BK9.caption;
      const thumbnailUrl = response.data.BK9.thumbnail;

      await zk.sendMessage(dest, {
        image: { url: thumbnailUrl },
        caption: `Username: ${username}\nCaption: ${caption}`,
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        caption: '> 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝗰𝗵𝗼𝗼𝘀𝗶𝗻𝗴 𝗕𝗲𝗹𝘁𝗮𝗵 𝗠𝗱',
        gifPlayback: false
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});

keith({
  nomCom: "likee",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a Likee video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/likee?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9.withoutwatermark;
      const title = response.data.BK9.title;
      const thumbnailUrl = response.data.BK9.thumbnail;

      await zk.sendMessage(dest, {
        image: { url: thumbnailUrl },
        caption: `Title: ${title}`,
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        caption: conf.BOT,
        gifPlayback: false
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});


keith({
  nomCom: "capcut",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a CapCut video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/capcut?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9.video;
      const title = response.data.BK9.title || "CapCut Video";
      const description = response.data.BK9.description || "No description provided.";
      const usage = response.data.BK9.usage || "No usage information provided.";

      await zk.sendMessage(dest, {
        text: `Title: ${title}\nDescription: ${description}\nUsage: ${usage}`,
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        caption: conf.BOT,
        gifPlayback: false
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});


keith({
  nomCom: "pinterest",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a Pinterest video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/pinterest?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9[0].url;
      const imageUrl = response.data.BK9[1].url;

      await zk.sendMessage(dest, {
        image: { url: imageUrl },
        caption: conf.BOT,
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        caption: conf.BOT,
        gifPlayback: false
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});

keith({
  nomCom: "tiktok",
  aliases: ["tiktokdl2", "tikdl"],
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a TikTok video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/tiktok?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9.BK9;
      const description = response.data.BK9.desc;
      const commentCount = response.data.BK9.comment_count;
      const likesCount = response.data.BK9.likes_count;
      const uid = response.data.BK9.uid;
      const nickname = response.data.BK9.nickname;
      const musicTitle = response.data.BK9.music_info.title;

      await zk.sendMessage(dest, {
        text: `Description: ${description}\nComments: ${commentCount}\nLikes: ${likesCount}\nUser ID: ${uid}\nNickname: ${nickname}\nMusic: ${musicTitle}`,
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        caption: conf.BOT,
        gifPlayback: false
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});


keith({
  nomCom: "appvn",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert an AppVN APK link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/getAppVn?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const downloadUrl = response.data.BK9.download.url;
      const title = response.data.BK9.about.descriptionTitle || "AppVN APK";
      const description = response.data.BK9.about.descriptionShort || "No description provided.";
      const latestUpdate = response.data.BK9.about.latestUpdate || "No update date provided.";
      const fileSize = response.data.BK9.download.size || "Unknown size";
      const ogImage = response.data.BK9.about.ogImage;

      await zk.sendMessage(dest, {
        image: { url: ogImage },
        caption: `Title: ${title}\nDescription: ${description}\nLatest Update: ${latestUpdate}\nSize: ${fileSize}`,
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        document: { url: downloadUrl },
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${title}.apk`,
        caption: conf.BOT,
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve APK from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});


keith({
  nomCom: "porn",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const videoLink = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a video link.');
  }

  try {
    const response = await axios.get(`https://api.davidcyriltech.my.id/xvideo?url=${encodeURIComponent(videoLink)}`);

    if (response.data.success) {
      const title = response.data.title;
      const thumbnail = response.data.thumbnail;
      const downloadUrl = response.data.download_url;

      await zk.sendMessage(dest, {
        video: { url: downloadUrl },
        caption: title,
        contextInfo: {
          externalAdReply: {
            title: "Video Downloader",
            body: title,
            thumbnailUrl: thumbnail,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true, // Verified badge
          },
        },
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});



/*keith({
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

    // Send the APK file to the group with thumbnail
    await client.sendMessage(groupId, {
      document: { url: appDetails.BK9.dllink },
      fileName: `${appDetails.BK9.name}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption: `Downloaded by ${conf.OWNER_NAME}`,
      contextInfo: {
        externalAdReply: {
          mediaUrl: thumb,
          mediaType: 1,
          thumbnailUrl: thumb,
          title: "Alpha APK Download",
          body: appDetails.BK9.name,
          sourceUrl: conf.GURL, // Using configured source URL
          showAdAttribution: true
        }
      }
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

    // Send the zip file link as a document
    await zk.sendMessage(dest, {
      document: { url: apiUrl },
      fileName: `${fileName}.zip`,
      mimetype: "application/zip",
      caption: `*Downloaded by ${conf.BOT}*`,
      contextInfo: {
        externalAdReply: {
          title: `${conf.BOT} GIT CLONE`,
          body: conf.OWNER_NAME,
          thumbnailUrl: conf.URL,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true
        }
      }
    }, { quoted: ms });
  } catch (error) {
    // Handle error if the repository cannot be fetched
    console.error(error);
    repondre("Error fetching GitHub repository.");
  }
});*/


keith({
  nomCom: "instagram",
  aliases: ["igdl", "ig", "insta"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  // Check if the argument (Instagram link) is provided
  if (!arg[0]) {
    return repondre('Please provide a valid public Instagram video link!');
  }

  // Validate the Instagram URL format
  if (!arg[0].includes('https://www.instagram.com/')) {
    return repondre("That is not a valid Instagram link.");
  }

  try {
    // Fetch the download data for the Instagram video
    let downloadData = await igdl(arg[0]);

    // Check if the data returned is valid
    if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
      return repondre("No video found at the provided Instagram link.");
    }

    let videoData = downloadData.data;

    // Process the first 20 videos (if available)
    for (let i = 0; i < Math.min(20, videoData.length); i++) {
      let video = videoData[i];

      // Ensure the video object and URL are defined
      if (!video || !video.url) {
        continue; // Skip if the video data is incomplete
      }

      let videoUrl = video.url;

      // Send the video to the chat
      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        mimetype: "video/mp4",
        caption: `*Instagram Video Downloaded by ${conf.BOT}*`,
        contextInfo: {
          externalAdReply: {
            title: `${conf.BOT} IG DL`,
            body: conf.OWNER_NAME,
            thumbnailUrl: conf.URL,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true
          }
        }
      }, { quoted: ms });
    }

  } catch (error) {
    // Catch and log any errors
    console.error(error);
    return repondre("An error occurred while processing the request.Try igdl2 using this link.");
  }
});

keith({
  nomCom: "facebook2",
  aliases: ["fbdl2", "facebookdl2", "fb2"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  // Check if there is a Facebook URL in the arguments
  if (!arg[0]) {
    return repondre('Please insert a public Facebook video link!');
  }

  // Validate that the argument contains "https://"
  if (!arg[0].includes('https://')) {
    return repondre("That is not a valid Facebook link.");
  }

  try {
    // Download the Facebook video data
    const videoData = await facebook(arg[0]);

    // Prepare the message caption with video details
    const caption = `
     *𝗕𝗘𝗟𝗧𝗔𝗛-𝗠𝗗 𝐅𝐁 𝐃𝐋*
    |__________________________|
    |       *ᴅᴜʀᴀᴛɪᴏɴ*  
           ${videoData.result.duration}
    |_________________________
    | REPLY WITH BELOW NUMBERS
    |_________________________
    |____  *ғᴀᴄᴇʙᴏᴏᴋ ᴠᴅᴇᴏ ᴅʟ*  ____
    |-᳆  1 sᴅ ǫᴜᴀʟɪᴛʏ
    |-᳆  2 ʜᴅ ǫᴜᴀʟɪᴛʏ
    |_________________________
    |____  *ғᴀᴄᴇʙᴏᴏᴋ ᴀᴜᴅɪᴏ ᴅʟ*  ____
    |-᳆  3 ᴀᴜᴅɪᴏ
    |-᳆  4 ᴅᴏᴄᴜᴍᴇɴᴛ
    |-᳆  5 ᴘᴛᴛ(ᴠᴏɪᴄᴇ)
    |__________________________|
    `;

    // Send the image and caption with a reply
    const message = await zk.sendMessage(dest, {
      image: { url: videoData.result.thumbnail },
      caption: caption,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          title: `${conf.BOT} FB DL`,
          body: `Duration: ${videoData.result.duration}`,
          thumbnailUrl: videoData.result.thumbnail,
          sourceUrl: conf.GURL,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: ms });

    const messageId = message.key.id;

    // Event listener for reply messages
    zk.ev.on("messages.upsert", async (update) => {
      const messageContent = update.messages[0];
      if (!messageContent.message) return;

      // Get the response text (from the conversation or extended message)
      const responseText = messageContent.message.conversation || messageContent.message.extendedTextMessage?.text;

      // Check if the message is a reply to the initial message
      const isReplyToMessage = messageContent.message.extendedTextMessage?.contextInfo.stanzaId === messageId;

      if (isReplyToMessage) {
        // React to the message
        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        // Extract video details
        const videoDetails = videoData.result;

        // React with an upward arrow
        await zk.sendMessage(dest, {
          react: { text: '⬆️', key: messageContent.key },
        });

        // Send the requested media based on the user's response
        if (responseText === '1') {
          await zk.sendMessage(dest, {
            video: { url: videoDetails.links.SD },
            caption: "*𝗕𝗘𝗟𝗧𝗔𝗛-𝗠𝗗*",
          }, { quoted: messageContent });
        } else if (responseText === '2') {
          await zk.sendMessage(dest, {
            video: { url: videoDetails.links.HD },
            caption: "*𝗕𝗘𝗟𝗧𝗔𝗛-𝗠𝗗*",
          }, { quoted: messageContent });
        } else if (responseText === '3') {
          await zk.sendMessage(dest, {
            audio: { url: videoDetails.links.SD },
            mimetype: "audio/mpeg",
          }, { quoted: messageContent });
        } else if (responseText === '4') {
          await zk.sendMessage(dest, {
            document: {
              url: videoDetails.links.SD
            },
            mimetype: "audio/mpeg",
            fileName: "Beltah.mp3",
            caption: "*BELTAH MD*"
          }, {
            quoted: messageContent
          });
        } else if (responseText === '5') {
          await zk.sendMessage(dest, {
            audio: {
              url: videoDetails.links.SD
            },
            mimetype: 'audio/mp4',
            ptt: true
          }, {
            quoted: messageContent
          });
        } else {
          // If the response is invalid, inform the user
          await zk.sendMessage(dest, {
            text: "Invalid option. Please reply with a valid number (1-5).",
            quoted: messageContent
          });
        }
      }
    });
  } catch (error) {
    console.error(error);
    repondre('An error occurred: try fbdl2 using this link' + error.message);
  }
});

keith({
  nomCom: "tiktok2",
  aliases: ["tikdl2", "tiktokdl2"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  if (!arg[0]) {
    return repondre('Please insert a public TikTok video link!');
  }

  if (!arg[0].includes('tiktok.com')) {
    return repondre("That is not a valid TikTok link.");
  }

  try {
    // Download the TikTok video data
    let tiktokData = await downloadTiktok(arg[0]);

    const caption = `
     *𝗕𝗘𝗟𝗧𝗔𝗛-𝗠𝗗 𝐓𝐈𝐊𝐓𝐎𝐊 𝐃𝐋*
    |__________________________|
    |-᳆        *ᴛɪᴛʟᴇ*  
     ${tiktokData.result.title}
    |_________________________
    ʀᴇᴘʟʏ ᴡɪᴛʜ ʙᴇʟᴏᴡ ɴᴜᴍʙᴇʀs 
    |-᳆  *1* sᴅ ǫᴜᴀʟɪᴛʏ
    |-᳆  *2*  ʜᴅ ǫᴜᴀʟɪᴛʏ
    |-᳆  *3*  ᴀᴜᴅɪᴏ
    |__________________________|
    `;

    // Send the image and caption with a reply
    const message = await zk.sendMessage(dest, {
      image: { url: tiktokData.result.image },
      caption: caption,
    });

    const messageId = message.key.id;

    // Event listener for reply messages
    zk.ev.on("messages.upsert", async (update) => {
      const messageContent = update.messages[0];
      if (!messageContent.message) return;

      const responseText = messageContent.message.conversation || messageContent.message.extendedTextMessage?.text;
      const keithdl = messageContent.key.remoteJid;

      // Check if the response is a reply to the message we sent
      const isReplyToMessage = messageContent.message.extendedTextMessage?.contextInfo.stanzaId === messageId;

      if (isReplyToMessage) {
        // React to the message
        await zk.sendMessage(keithdl, {
          react: { text: '⬇️', key: messageContent.key },
        });

        const tiktokLinks = tiktokData.result;

        await zk.sendMessage(keithdl, {
          react: { text: '⬆️', key: messageContent.key },
        });

        // Send the requested media based on the user's response
        if (responseText === '1') {
          await zk.sendMessage(keithdl, {
            video: { url: tiktokLinks.dl_link.download_mp4_1 },
            caption: "*𝐀𝐋𝐏𝐇𝐀 𝐌𝐃*",
          }, { quoted: messageContent });
        } else if (responseText === '2') {
          await zk.sendMessage(keithdl, {
            video: { url: tiktokLinks.dl_link.download_mp4_2 },
            caption: "*𝐀𝐋𝐏𝐇𝐀 𝐌𝐃*",
          }, { quoted: messageContent });
        } else if (responseText === '3') {
          await zk.sendMessage(keithdl, {
            audio: { url: tiktokLinks.dl_link.download_mp3 },
            mimetype: "audio/mpeg",
          }, { quoted: messageContent });
        }
      }
    });
  } catch (error) {
    console.error(error);
    repondre('An error occurred .Kindly try tiktok2 using this link: ' + error.message);
  }
});

keith({
  nomCom: "spotify",
  aliases: ["sdl", "spotifydl"],
  reaction: '🗿',
  categorie: "download"
}, async (dest, zk, params) => {
  const { repondre, arg, ms } = params;  
  const text = arg.join(" ").trim(); 

  if (!text) {
    return repondre("What song do you want to download?");
  }

  try {
    let data = await axios.get(`https://api.dreaded.site/api/spotifydl?title=${text}`);

    if (data.data.success) {
      const audio = data.data.result.downloadLink;
      const filename = data.data.result.title;

      await zk.sendMessage(dest, {
        document: { url: audio },
        mimetype: "audio/mpeg",
        fileName: `${filename}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: conf.BOT,
            body: "spotify download",
            mediaType: 1,
            sourceUrl: conf.GURL,
            thumbnailUrl: conf.URL,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        audio: { url: audio },
        mimetype: "audio/mpeg",
        fileName: `${filename}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: conf.BOT,
            body: "spotify download",
            mediaType: 1,
            sourceUrl: conf.GURL,
            thumbnailUrl: conf.URL,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        document: { url: audio },
        mimetype: "audio/mp4",
        fileName: `${filename}.mp4`,
        contextInfo: {
          externalAdReply: {
            title: conf.BOT,
            body: "spotify download",
            mediaType: 1,
            sourceUrl: conf.GURL,
            thumbnailUrl: conf.URL,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      }, { quoted: ms });

    } else {
      await repondre("Failed to get a valid response from API endpoint");
    }

  } catch (error) {
    console.error("Error fetching the download link:", error);
    await repondre("Unable to fetch download link, try matching exact song name or with artist name.");
  }
});
keith({
  nomCom: "fbdl",
  aliases: ["fb", "facebook"],
  desc: "to download Facebook video",
  categorie: "download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  if (!arg[0]) {
    return repondre('Insert a public Facebook video link!');
  }

  const queryURL = arg.join(" ");

  try {
    const result = await getFBInfo(queryURL);
    let caption = `
    Title: ${result.title}
    Link: ${result.url}
    `;
    await zk.sendMessage(dest, { image: { url: result.thumbnail }, caption: caption }, { quoted: ms });
    await zk.sendMessage(dest, { video: { url: result.hd }, caption: 'downloaded successfully' }, { quoted: ms });

  } catch (error) {
    console.error('Error:', error);
    repondre('Try fbdl3 on the link');
  }
});
