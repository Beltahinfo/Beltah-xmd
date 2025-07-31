const { keith } = require('../keizzah/keith');
const axios = require('axios');
const fs = require('fs-extra');
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");
const { igdl } = require('ruhend-scraper');
const conf = require(__dirname + "/../set");
const getFBInfo = require("@xaviabot/fb-downloader");

// Constants for context info defaults
const DEFAULT_PARTICIPANT = '0@s.whatsapp.net';
const DEFAULT_REMOTE_JID = 'status@broadcast';
const DEFAULT_THUMBNAIL_URL = 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg';
const DEFAULT_TITLE = "Beltah Tech Updates";
const DEFAULT_BODY = "🟢 Powering Smart Automation 🟢";

// Context info function
function commonContextInfo() {
  try {
    return {
      mentionedJid: [DEFAULT_PARTICIPANT],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363249464136503@newsletter",
        newsletterName: "Beltah Tech Updates🇰🇪",
        serverMessageId: Math.floor(100000 + Math.random() * 900000),
      },
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || DEFAULT_TITLE}`,
        body: DEFAULT_BODY,
        thumbnailUrl: conf.URL || DEFAULT_THUMBNAIL_URL,
        sourceUrl: conf.GURL || 'https://wa.me/254114141192',
        mediaType: 1,
        renderLargerThumbnail: true,
      },
    };
  } catch (error) {
    console.error(`Error in commonContextInfo: ${error.message}`);
    return {};
  }
}

function formatViews(views) {
  if (typeof views === 'number') {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  }
  return views;
}

// FACEBOOK
keith({
  nomCom: "facebook",
  aliases: ["fbdl", "facebookdl", "fb"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  if (!arg || !arg[0]) {
    return repondre(zk, dest, ms, 'Please provide a Facebook video URL!');
  }

  const fbUrl = arg[0].trim();
  if (!fbUrl.includes('https://') || !fbUrl.includes('facebook.com')) {
    return repondre(zk, dest, ms, "Please provide a valid Facebook video URL.");
  }

  try {
    const videoData = await getFBInfo(fbUrl);

    if (!videoData || !videoData.sd) {
      return repondre(zk, dest, ms, "Could not retrieve video information. The link may be invalid or private.");
    }

    const caption = `
     *${conf.BOT || 'Facebook Downloader'} Facebook Downloader*
    |__________________________|
    |       *ᴛɪᴛʟᴇ*  
           ${videoData.title || 'No title available'}
    |_________________________|
    | REPLY WITH BELOW NUMBERS
    |_________________________|
    |____  *ᴠɪᴅᴇᴏ ᴅᴏᴡɴʟᴏᴀᴅ*  ____
    |-᳆  1. SD Quality
    |-᳆  2. HD Quality
    |_________________________|
    |____  *ᴀᴜᴅɪᴏ ᴅᴏᴡɴʟᴏᴀᴅ*  ____
    |-᳆  3. Audio Only
    |-᳆  4. As Document
    |-᳆  5. As Voice Message
    |__________________________|
    `;

    const message = await zk.sendMessage(dest, {
      image: { url: videoData.thumbnail || '' },
      caption: caption,
      contextInfo: commonContextInfo()
    }, { quoted: ms });

    const messageId = message.key.id;

    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation ||
          messageContent.message.extendedTextMessage?.text;

        if (!['1', '2', '3', '4', '5'].includes(responseText)) {
          return await zk.sendMessage(dest, {
            text: "Invalid option. Please reply with a number between 1-5.",
            quoted: messageContent,
            contextInfo: commonContextInfo()
          });
        }

        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        switch (responseText) {
          case '1':
            await zk.sendMessage(dest, {
              video: { url: videoData.sd },
              caption: `*${conf.BOT || 'Facebook Downloader'}* - SD Quality`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '2':
            if (videoData.hd) {
              await zk.sendMessage(dest, {
                video: { url: videoData.hd },
                caption: `*${conf.BOT || 'Facebook Downloader'}* - HD Quality`,
                contextInfo: commonContextInfo()
              }, { quoted: messageContent });
            } else {
              await zk.sendMessage(dest, {
                text: "HD quality not available. Sending SD quality instead.",
                quoted: messageContent,
                contextInfo: commonContextInfo()
              });
              await zk.sendMessage(dest, {
                video: { url: videoData.sd },
                caption: `*${conf.BOT || 'Facebook Downloader'}* - SD Quality`,
                contextInfo: commonContextInfo()
              }, { quoted: messageContent });
            }
            break;

          case '3':
            await zk.sendMessage(dest, {
              audio: { url: videoData.sd },
              mimetype: "audio/mpeg",
              caption: `*${conf.BOT || 'Facebook Downloader'}* - Audio`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '4':
            await zk.sendMessage(dest, {
              document: { url: videoData.sd },
              mimetype: "video/mp4",
              fileName: `${conf.BOT || 'Facebook'}_${Date.now()}.mp4`,
              caption: `*${conf.BOT || 'Facebook Downloader'}* - Video Document`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '5':
            await zk.sendMessage(dest, {
              audio: { url: videoData.sd },
              mimetype: "audio/ogg; codecs=opus",
              ptt: true,
              caption: `*${conf.BOT || 'Facebook Downloader'}* - Voice Message`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;
        }

        await zk.sendMessage(dest, {
          react: { text: '✅', key: messageContent.key },
        });

      } catch (error) {
        console.error("Error handling reply:", error);
        await zk.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: update.messages[0],
          contextInfo: commonContextInfo()
        });
      }
    };

    zk.ev.on("messages.upsert", replyHandler);
    setTimeout(() => {
      zk.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("Facebook download error:", error);
    repondre(zk, dest, ms, `Failed to download video. Error: ${error.message}\nYou can try with another link or check if the video is public.`);
  }
});

// TWITTER
keith({
  nomCom: "twitter",
  aliases: ["twitdl", "twitterdl", "tw", "xdl"],
  categorie: "Download",
  reaction: "🐦"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  if (!arg || !arg[0]) {
    return repondre(zk, dest, ms, 'Please provide a Twitter video URL!');
  }

  const tweetUrl = arg[0].trim();
  if (!tweetUrl.includes('https://') || !tweetUrl.includes('twitter.com')) {
    return repondre(zk, dest, ms, "Please provide a valid Twitter URL.");
  }

  try {
    const apiUrl = `https://apis-keith.vercel.app/download/twitter?url=${encodeURIComponent(tweetUrl)}`;
    const response = await axios.get(apiUrl);
    const tweetData = response.data;

    if (!tweetData.status || !tweetData.result) {
      return repondre(zk, dest, ms, "Could not retrieve video information. The tweet may be private or not contain media.");
    }

    const videoInfo = tweetData.result;

    const caption = `
     *${conf.BOT || 'Twitter Downloader'} twitter Downloader*
    |__________________________|
    |       *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ*  
    ${videoInfo.desc || 'No description available'}
    |_________________________|
    | REPLY WITH BELOW NUMBERS
    |_________________________|
    |____  *ᴠɪᴅᴇᴏ ᴅᴏᴡɴʟᴏᴀᴅ*  ____
    |-᳆  1. SD Quality (480p)
    |-᳆  2. HD Quality (720p)
    |_________________________|
    |____  *ᴀᴜᴅɪᴏ ᴅᴏᴡɴʟᴏᴀᴅ*  ____
    |-᳆  3. Audio Only
    |-᳆  4. As Document
    |__________________________|
    `;

    const message = await zk.sendMessage(dest, {
      image: { url: videoInfo.thumb || '' },
      caption: caption,
      contextInfo: commonContextInfo()
    }, { quoted: ms });

    const messageId = message.key.id;

    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation ||
          messageContent.message.extendedTextMessage?.text;

        if (!['1', '2', '3', '4'].includes(responseText)) {
          return await zk.sendMessage(dest, {
            text: "Invalid option. Please reply with a number between 1-4.",
            quoted: messageContent,
            contextInfo: commonContextInfo()
          });
        }

        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        switch (responseText) {
          case '1':
            await zk.sendMessage(dest, {
              video: { url: videoInfo.video_sd },
              caption: `*${conf.BOT || 'Twitter Downloader'}* - SD Quality`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '2':
            if (videoInfo.video_hd) {
              await zk.sendMessage(dest, {
                video: { url: videoInfo.video_hd },
                caption: `*${conf.BOT || 'Twitter Downloader'}* - HD Quality`,
                contextInfo: commonContextInfo()
              }, { quoted: messageContent });
            } else {
              await zk.sendMessage(dest, {
                text: "HD quality not available. Sending SD quality instead.",
                quoted: messageContent,
                contextInfo: commonContextInfo()
              });
              await zk.sendMessage(dest, {
                video: { url: videoInfo.video_sd },
                caption: `*${conf.BOT || 'Twitter Downloader'}* - SD Quality`,
                contextInfo: commonContextInfo()
              }, { quoted: messageContent });
            }
            break;

          case '3':
            await zk.sendMessage(dest, {
              audio: { url: videoInfo.audio },
              mimetype: "audio/mpeg",
              caption: `*${conf.BOT || 'Twitter Downloader'}* - Audio`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '4':
            await zk.sendMessage(dest, {
              document: { url: videoInfo.video_sd },
              mimetype: "video/mp4",
              fileName: `${conf.BOT || 'Twitter'}_${Date.now()}.mp4`,
              caption: `*${conf.BOT || 'Twitter Downloader'}* - Video Document`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;
        }

        await zk.sendMessage(dest, {
          react: { text: '✅', key: messageContent.key },
        });

      } catch (error) {
        console.error("Error handling reply:", error);
        await zk.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: update.messages[0],
          contextInfo: commonContextInfo()
        });
      }
    };

    zk.ev.on("messages.upsert", replyHandler);
    setTimeout(() => {
      zk.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("Twitter download error:", error);
    repondre(zk, dest, ms, `Failed to download tweet. Error: ${error.message}\nYou can try with another link or check if the tweet is public.`);
  }
});

// INSTAGRAM
keith({
  nomCom: "instagram",
  aliases: ["igdl", "insta", "ig"],
  categorie: "Download",
  reaction: "📸"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  if (!arg || !arg[0]) {
    return repondre(zk, dest, ms, 'Please provide an Instagram URL!');
  }

  const igUrl = arg[0].trim();
  if (!igUrl.includes('https://') || !igUrl.includes('instagram.com')) {
    return repondre(zk, dest, ms, "Please provide a valid Instagram URL.");
  }

  try {
    const apiUrl = `https://apis-keith.vercel.app/download/instagramdl?url=${encodeURIComponent(igUrl)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result || !data.result.downloadUrl) {
      return repondre(zk, dest, ms, "Could not retrieve video. The post may be private or unavailable.");
    }

    const downloadUrl = data.result.downloadUrl;
    const isVideo = data.result.type === 'mp4';

    const caption = `
     *${conf.BOT || 'Instagram Downloader'} Instagram Downloader*
    |__________________________|
    | Media Type: ${isVideo ? 'Video' : 'Unknown'}
    |_________________________|
    | REPLY WITH BELOW NUMBERS
    |_________________________|
    |-᳆  1. Video
    |-᳆  2. Video as Document
    |-᳆  3. Audio Only
    |-᳆  4. Audio as Document
    |__________________________|
    `;

    const message = await zk.sendMessage(dest, {
      image: { url: conf.URL || '' },
      caption: caption,
      contextInfo: commonContextInfo()
    }, { quoted: ms });

    const messageId = message.key.id;

    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation ||
          messageContent.message.extendedTextMessage?.text;

        if (!['1', '2', '3', '4'].includes(responseText)) {
          return await zk.sendMessage(dest, {
            text: "Invalid option. Please reply with a number between 1-4.",
            quoted: messageContent,
            contextInfo: commonContextInfo()
          });
        }

        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        switch (responseText) {
          case '1':
            await zk.sendMessage(dest, {
              video: { url: downloadUrl },
              caption: `*${conf.BOT || 'Instagram Downloader'}* - Video`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '2':
            await zk.sendMessage(dest, {
              document: { url: downloadUrl },
              mimetype: "video/mp4",
              fileName: `${conf.BOT || 'Instagram'}_${Date.now()}.mp4`,
              caption: `*${conf.BOT || 'Instagram Downloader'}* - Video Document`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '3':
            await zk.sendMessage(dest, {
              audio: { url: downloadUrl },
              mimetype: "audio/mpeg",
              caption: `*${conf.BOT || 'Instagram Downloader'}* - Audio`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '4':
            await zk.sendMessage(dest, {
              document: { url: downloadUrl },
              mimetype: "audio/mpeg",
              fileName: `${conf.BOT || 'Instagram'}_${Date.now()}.mp3`,
              caption: `*${conf.BOT || 'Instagram Downloader'}* - Audio Document`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;
        }

        await zk.sendMessage(dest, {
          react: { text: '✅', key: messageContent.key },
        });

      } catch (error) {
        console.error("Error handling reply:", error);
        await zk.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: update.messages[0],
          contextInfo: commonContextInfo()
        });
      }
    };

    zk.ev.on("messages.upsert", replyHandler);
    setTimeout(() => {
      zk.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("Instagram download error:", error);
    repondre(zk, dest, ms, `Failed to download Instagram media. Error: ${error.message}\nYou can try with another link or check if the post is public.`);
  }
});

// TIKTOK
keith({
  nomCom: "tiktok",
  aliases: ["ttdl", "tiktokdl", "tt"],
  categorie: "Download",
  reaction: "🎵"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  if (!arg || !arg[0]) {
    return repondre(zk, dest, ms, 'Please provide a TikTok URL!');
  }

  const tiktokUrl = arg[0].trim();
  if (!tiktokUrl.includes('https://') || !(tiktokUrl.includes('tiktok.com') || tiktokUrl.includes('vt.tiktok.com'))) {
    return repondre(zk, dest, ms, "Please provide a valid TikTok URL.");
  }

  try {
    const apiUrl = `https://apis-keith.vercel.app/download/tiktokdl?url=${encodeURIComponent(tiktokUrl)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result) {
      return repondre(zk, dest, ms, "Could not retrieve video. The TikTok may be private or unavailable.");
    }

    const videoInfo = data.result;

    const caption = `
     *${conf.BOT || 'TikTok Downloader'} TikTok Downloader*
    |__________________________|
    | *Title*: ${videoInfo.title || 'No title'}
    | *Caption*: ${videoInfo.caption || 'No caption'}
    |_________________________|
    | REPLY WITH BELOW NUMBERS
    |_________________________|
    |-᳆  1. Video (No Watermark)
    |-᳆  2. Video as Document
    |-᳆  3. Audio Only
    |-᳆  4. Audio as Document
    |__________________________|
    `;

    const message = await zk.sendMessage(dest, {
      image: { url: videoInfo.thumbnail || conf.URL || '' },
      caption: caption,
      contextInfo: commonContextInfo()
    }, { quoted: ms });

    const messageId = message.key.id;

    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation ||
          messageContent.message.extendedTextMessage?.text;

        if (!['1', '2', '3', '4'].includes(responseText)) {
          return await zk.sendMessage(dest, {
            text: "Invalid option. Please reply with a number between 1-4.",
            quoted: messageContent,
            contextInfo: commonContextInfo()
          });
        }

        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        switch (responseText) {
          case '1':
            await zk.sendMessage(dest, {
              video: { url: videoInfo.nowm },
              caption: `*${conf.BOT || 'TikTok Downloader'}* - Video (No Watermark)\n${videoInfo.caption || ''}`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '2':
            await zk.sendMessage(dest, {
              document: { url: videoInfo.nowm },
              mimetype: "video/mp4",
              fileName: `${conf.BOT || 'TikTok'}_${Date.now()}.mp4`,
              caption: `*${conf.BOT || 'TikTok Downloader'}* - Video Document\n${videoInfo.caption || ''}`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '3':
            await zk.sendMessage(dest, {
              audio: { url: videoInfo.mp3 },
              mimetype: "audio/mpeg",
              caption: `*${conf.BOT || 'TikTok Downloader'}* - Audio\n${videoInfo.caption || ''}`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;

          case '4':
            await zk.sendMessage(dest, {
              document: { url: videoInfo.mp3 },
              mimetype: "audio/mpeg",
              fileName: `${conf.BOT || 'TikTok'}_${Date.now()}.mp3`,
              caption: `*${conf.BOT || 'TikTok Downloader'}* - Audio Document\n${videoInfo.caption || ''}`,
              contextInfo: commonContextInfo()
            }, { quoted: messageContent });
            break;
        }

        await zk.sendMessage(dest, {
          react: { text: '✅', key: messageContent.key },
        });

      } catch (error) {
        console.error("Error handling reply:", error);
        await zk.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: update.messages[0],
          contextInfo: commonContextInfo()
        });
      }
    };

    zk.ev.on("messages.upsert", replyHandler);
    setTimeout(() => {
      zk.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("TikTok download error:", error);
    repondre(zk, dest, ms, `Failed to download TikTok. Error: ${error.message}\nYou can try with another link or check if the video is public.`);
  }
});

// MEDIAFIRE
keith({
  nomCom: "mediafire",
  aliases: ["mfire", "mfdl", "mediafiredl"],
  categorie: "Download",
  reaction: "📦"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  if (!arg || !arg[0]) {
    return repondre(zk, dest, ms, 'Please provide a MediaFire URL!');
  }

  const mediafireUrl = arg[0].trim();
  if (!mediafireUrl.includes('https://') || !mediafireUrl.includes('mediafire.com')) {
    return repondre(zk, dest, ms, "Please provide a valid MediaFire URL.");
  }

  try {
    const apiUrl = `https://apis-keith.vercel.app/download/mfire?url=${encodeURIComponent(mediafireUrl)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result || !data.result.dl_link) {
      return repondre(zk, dest, ms, "Could not retrieve file. The link may be invalid or the file unavailable.");
    }

    const fileInfo = data.result;

    const fileInfoMessage = `
     *${conf.BOT || 'MediaFire Downloader'} MediaFire Downloader*
    |__________________________|
    | *File Name*: ${fileInfo.fileName}
    | *File Type*: ${fileInfo.fileType}
    | *File Size*: ${fileInfo.size}
    | *Upload Date*: ${fileInfo.date}
    |__________________________|
    Downloading file...
    `;

    await zk.sendMessage(dest, {
      text: fileInfoMessage,
      contextInfo: commonContextInfo()
    }, { quoted: ms });

    await zk.sendMessage(dest, {
      document: {
        url: fileInfo.dl_link
      },
      mimetype: fileInfo.fileType,
      fileName: fileInfo.fileName,
      caption: `*${conf.BOT || 'MediaFire Downloader'}*\nHere's your requested file: ${fileInfo.fileName}`,
      contextInfo: commonContextInfo()
    });

  } catch (error) {
    console.error("MediaFire download error:", error);
    repondre(zk, dest, ms, `Failed to download file. Error: ${error.message}\nPlease check the link and try again.`);
  }
});

// HENTAIVID
keith({
  nomCom: "hentaivid",
  aliases: ["hvid", "hentaidl", "hv"],
  categorie: "download",
  reaction: "🔞"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  try {
    const apiUrl = 'https://apis-keith.vercel.app/dl/hentaivid';
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result || data.result.length === 0) {
      return repondre(zk, dest, ms, "Could not retrieve videos. Please try again later.");
    }

    const videos = data.result.slice(0, 8);

    let caption = `*${conf.BOT || 'Hentai Downloader'}*\n`;
    caption += `Available videos (1-8):\n`;
    caption += `|__________________________|\n`;

    videos.forEach((video, index) => {
      caption += `| ${index + 1}. ${video.title}\n`;
      caption += `| 👉 ${video.category}\n`;
      caption += `| 👁️ ${video.views_count} views | 🔗 ${video.share_count} shares\n`;
      caption += `|__________________________|\n`;
    });

    caption += `\nReply with a number (1-8) to download that video.`;

    const message = await zk.sendMessage(dest, {
      text: caption,
      contextInfo: commonContextInfo()
    }, { quoted: ms });

    const messageId = message.key.id;

    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation ||
          messageContent.message.extendedTextMessage?.text;

        const selectedNum = parseInt(responseText);
        if (isNaN(selectedNum) || selectedNum < 1 || selectedNum > videos.length) {
          return await zk.sendMessage(dest, {
            text: `Invalid selection. Please reply with a number between 1-${videos.length}.`,
            quoted: messageContent,
            contextInfo: commonContextInfo()
          });
        }

        const selectedVideo = videos[selectedNum - 1];

        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        await zk.sendMessage(dest, {
          video: { url: selectedVideo.media.video_url },
          caption: `*${selectedVideo.title}*\nCategory: ${selectedVideo.category}\nViews: ${selectedVideo.views_count} | Shares: ${selectedVideo.share_count}`,
          contextInfo: commonContextInfo()
        }, { quoted: messageContent });

        await zk.sendMessage(dest, {
          react: { text: '✅', key: messageContent.key },
        });

      } catch (error) {
        console.error("Error handling reply:", error);
        await zk.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: update.messages[0],
          contextInfo: commonContextInfo()
        });
      }
    };

    zk.ev.on("messages.upsert", replyHandler);
    setTimeout(() => {
      zk.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("Hentai video download error:", error);
    repondre(zk, dest, ms, `Failed to fetch videos. Error: ${error.message}`);
  }
});

// The rest of the YouTube/ytmp3/ytmp4 commands should also use contextInfo: commonContextInfo()
// in every zk.sendMessage call. If you want that portion or all YouTube logic included, let me know!
