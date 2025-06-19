
const { keith } = require('../keizzah/keith');
const axios = require('axios');
const fs = require('fs-extra');  
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");
const { igdl } = require('ruhend-scraper');
const conf = require(__dirname + "/../set");
const getFBInfo = require("@xaviabot/fb-downloader");

keith({
  nomCom: "facebook",
  aliases: ["fbdl", "facebookdl", "fb"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  // Validate input
  if (!arg || !arg[0]) {
    return repondre(zk, dest, ms, 'Please provide a Facebook video URL!');
  }

  const fbUrl = arg[0].trim();
  if (!fbUrl.includes('https://') || !fbUrl.includes('facebook.com')) {
    return repondre(zk, dest, ms, "Please provide a valid Facebook video URL.");
  }

  try {
    // Get Facebook video info
    const videoData = await getFBInfo(fbUrl);
    
    if (!videoData || !videoData.sd) {
      return repondre(zk, dest, ms, "Could not retrieve video information. The link may be invalid or private.");
    }

    // Prepare common contextInfo
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Facebook Downloader'}`,
        body: videoData.title || 'Facebook Video',
        thumbnailUrl: videoData.thumbnail || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Prepare caption with video options
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
    |____  *ᴀᴜᴅɪᴏ �ᴅᴏᴡɴʟᴏᴀᴅ*  ____
    |-᳆  3. Audio Only
    |-᳆  4. As Document
    |-᳆  5. As Voice Message
    |__________________________|
    `;

    // Send the initial message with thumbnail and options
    const message = await zk.sendMessage(dest, {
      image: { url: videoData.thumbnail || '' },
      caption: caption,
      contextInfo: commonContextInfo
    }, { quoted: ms });

    const messageId = message.key.id;

    // Set up reply handler
    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        // Check if this is a reply to our initial message
        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation || 
                           messageContent.message.extendedTextMessage?.text;

        // Validate response
        if (!['1', '2', '3', '4', '5'].includes(responseText)) {
          return await zk.sendMessage(dest, {
            text: "Invalid option. Please reply with a number between 1-5.",
            quoted: messageContent
          });
        }

        // Send loading reaction
        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        // Handle different download options with consistent contextInfo
        switch(responseText) {
          case '1': // SD Quality
            await zk.sendMessage(dest, {
              video: { url: videoData.sd },
              caption: `*${conf.BOT || 'Facebook Downloader'}* - SD Quality`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '2': // HD Quality
            if (videoData.hd) {
              await zk.sendMessage(dest, {
                video: { url: videoData.hd },
                caption: `*${conf.BOT || 'Facebook Downloader'}* - HD Quality`,
                contextInfo: commonContextInfo
              }, { quoted: messageContent });
            } else {
              await zk.sendMessage(dest, {
                text: "HD quality not available. Sending SD quality instead.",
                quoted: messageContent
              });
              await zk.sendMessage(dest, {
                video: { url: videoData.sd },
                caption: `*${conf.BOT || 'Facebook Downloader'}* - SD Quality`,
                contextInfo: commonContextInfo
              }, { quoted: messageContent });
            }
            break;
            
          case '3': // Audio Only
            await zk.sendMessage(dest, {
              audio: { url: videoData.sd },
              mimetype: "audio/mpeg",
              caption: `*${conf.BOT || 'Facebook Downloader'}* - Audio`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '4': // As Document
            await zk.sendMessage(dest, {
              document: { url: videoData.sd },
              mimetype: "video/mp4",
              fileName: `${conf.BOT || 'Facebook'}_${Date.now()}.mp4`,
              caption: `*${conf.BOT || 'Facebook Downloader'}* - Video Document`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '5': // As Voice Message
            await zk.sendMessage(dest, {
              audio: { url: videoData.sd },
              mimetype: "audio/ogg; codecs=opus",
              ptt: true,
              caption: `*${conf.BOT || 'Facebook Downloader'}* - Voice Message`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
        }

        // Send completion reaction
        await zk.sendMessage(dest, {
          react: { text: '✅', key: messageContent.key },
        });

      } catch (error) {
        console.error("Error handling reply:", error);
        await zk.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: messageContent
        });
      }
    };

    // Add event listener for replies
    zk.ev.on("messages.upsert", replyHandler);

    // Remove listener after 5 minutes to prevent memory leaks
    setTimeout(() => {
      zk.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("Facebook download error:", error);
    repondre(zk, dest, ms, `Failed to download video. Error: ${error.message}\nYou can try with another link or check if the video is public.`);
  }
});

keith({
  nomCom: "twitter",
  aliases: ["twitdl", "twitterdl", "tw", "xdl"],
  categorie: "Download",
  reaction: "🐦"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  // Validate input
  if (!arg || !arg[0]) {
    return repondre(zk, dest, ms, 'Please provide a Twitter video URL!');
  }

  const tweetUrl = arg[0].trim();
  if (!tweetUrl.includes('https://') || !tweetUrl.includes('twitter.com')) {
    return repondre(zk, dest, ms, "Please provide a valid Twitter URL.");
  }

  try {
    // API endpoint
    const apiUrl = `https://apis-keith.vercel.app/download/twitter?url=${encodeURIComponent(tweetUrl)}`;
    
    // Fetch Twitter video data
    const response = await axios.get(apiUrl);
    const tweetData = response.data;

    if (!tweetData.status || !tweetData.result) {
      return repondre(zk, dest, ms, "Could not retrieve video information. The tweet may be private or not contain media.");
    }

    const videoInfo = tweetData.result;

    // Prepare common contextInfo
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Twitter Downloader'}`,
        body: videoInfo.desc || 'Twitter Video',
        thumbnailUrl: videoInfo.thumb || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Prepare caption with video options
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

    // Send the initial message with thumbnail and options
    const message = await zk.sendMessage(dest, {
      image: { url: videoInfo.thumb || '' },
      caption: caption,
      contextInfo: commonContextInfo
    }, { quoted: ms });

    const messageId = message.key.id;

    // Set up reply handler
    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        // Check if this is a reply to our initial message
        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation || 
                           messageContent.message.extendedTextMessage?.text;

        // Validate response
        if (!['1', '2', '3', '4'].includes(responseText)) {
          return await zk.sendMessage(dest, {
            text: "Invalid option. Please reply with a number between 1-4.",
            quoted: messageContent
          });
        }

        // Send loading reaction
        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        // Handle different download options with consistent contextInfo
        switch(responseText) {
          case '1': // SD Quality
            await zk.sendMessage(dest, {
              video: { url: videoInfo.video_sd },
              caption: `*${conf.BOT || 'Twitter Downloader'}* - SD Quality`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '2': // HD Quality
            if (videoInfo.video_hd) {
              await zk.sendMessage(dest, {
                video: { url: videoInfo.video_hd },
                caption: `*${conf.BOT || 'Twitter Downloader'}* - HD Quality`,
                contextInfo: commonContextInfo
              }, { quoted: messageContent });
            } else {
              await zk.sendMessage(dest, {
                text: "HD quality not available. Sending SD quality instead.",
                quoted: messageContent
              });
              await zk.sendMessage(dest, {
                video: { url: videoInfo.video_sd },
                caption: `*${conf.BOT || 'Twitter Downloader'}* - SD Quality`,
                contextInfo: commonContextInfo
              }, { quoted: messageContent });
            }
            break;
            
          case '3': // Audio Only
            await zk.sendMessage(dest, {
              audio: { url: videoInfo.audio },
              mimetype: "audio/mpeg",
              caption: `*${conf.BOT || 'Twitter Downloader'}* - Audio`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '4': // As Document
            await zk.sendMessage(dest, {
              document: { url: videoInfo.video_sd },
              mimetype: "video/mp4",
              fileName: `${conf.BOT || 'Twitter'}_${Date.now()}.mp4`,
              caption: `*${conf.BOT || 'Twitter Downloader'}* - Video Document`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
        }

        // Send completion reaction
        await zk.sendMessage(dest, {
          react: { text: '✅', key: messageContent.key },
        });

      } catch (error) {
        console.error("Error handling reply:", error);
        await zk.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: messageContent
        });
      }
    };

    // Add event listener for replies
    zk.ev.on("messages.upsert", replyHandler);

    // Remove listener after 5 minutes to prevent memory leaks
    setTimeout(() => {
      zk.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("Twitter download error:", error);
    repondre(zk, dest, ms, `Failed to download tweet. Error: ${error.message}\nYou can try with another link or check if the tweet is public.`);
  }
});


keith({
  nomCom: "instagram",
  aliases: ["igdl", "insta", "ig"],
  categorie: "Download",
  reaction: "📸"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  // Validate input
  if (!arg || !arg[0]) {
    return repondre(zk, dest, ms, 'Please provide an Instagram URL!');
  }

  const igUrl = arg[0].trim();
  if (!igUrl.includes('https://') || !igUrl.includes('instagram.com')) {
    return repondre(zk, dest, ms, "Please provide a valid Instagram URL.");
  }

  try {
    // API endpoint
    const apiUrl = `https://apis-keith.vercel.app/download/instagramdl?url=${encodeURIComponent(igUrl)}`;
    
    // Fetch Instagram media data
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result || !data.result.downloadUrl) {
      return repondre(zk, dest, ms, "Could not retrieve video. The post may be private or unavailable.");
    }

    const downloadUrl = data.result.downloadUrl;
    const isVideo = data.result.type === 'mp4';

    // Prepare common contextInfo
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Instagram Downloader'}`,
        body: "Instagram Media Download",
        thumbnailUrl: conf.URL || '', // Use config URL for image
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Prepare caption with options
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

    // Send the initial message with options
    const message = await zk.sendMessage(dest, {
      image: { url: conf.URL || '' }, // Use config URL for image
      caption: caption,
      contextInfo: commonContextInfo
    }, { quoted: ms });

    const messageId = message.key.id;

    // Set up reply handler
    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        // Check if this is a reply to our initial message
        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation || 
                           messageContent.message.extendedTextMessage?.text;

        // Validate response
        if (!['1', '2', '3', '4'].includes(responseText)) {
          return await zk.sendMessage(dest, {
            text: "Invalid option. Please reply with a number between 1-4.",
            quoted: messageContent
          });
        }

        // Send loading reaction
        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        // Handle different download options
        switch(responseText) {
          case '1': // Video
            await zk.sendMessage(dest, {
              video: { url: downloadUrl },
              caption: `*${conf.BOT || 'Instagram Downloader'}* - Video`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '2': // Video as Document
            await zk.sendMessage(dest, {
              document: { url: downloadUrl },
              mimetype: "video/mp4",
              fileName: `${conf.BOT || 'Instagram'}_${Date.now()}.mp4`,
              caption: `*${conf.BOT || 'Instagram Downloader'}* - Video Document`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '3': // Audio Only
            await zk.sendMessage(dest, {
              audio: { url: downloadUrl },
              mimetype: "audio/mpeg",
              caption: `*${conf.BOT || 'Instagram Downloader'}* - Audio`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '4': // Audio as Document
            await zk.sendMessage(dest, {
              document: { url: downloadUrl },
              mimetype: "audio/mpeg",
              fileName: `${conf.BOT || 'Instagram'}_${Date.now()}.mp3`,
              caption: `*${conf.BOT || 'Instagram Downloader'}* - Audio Document`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
        }

        // Send completion reaction
        await zk.sendMessage(dest, {
          react: { text: '✅', key: messageContent.key },
        });

      } catch (error) {
        console.error("Error handling reply:", error);
        await zk.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: messageContent
        });
      }
    };

    // Add event listener for replies
    zk.ev.on("messages.upsert", replyHandler);

    // Remove listener after 5 minutes to prevent memory leaks
    setTimeout(() => {
      zk.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("Instagram download error:", error);
    repondre(zk, dest, ms, `Failed to download Instagram media. Error: ${error.message}\nYou can try with another link or check if the post is public.`);
  }
}); 


keith({
  nomCom: "tiktok",
  aliases: ["ttdl", "tiktokdl", "tt"],
  categorie: "Download",
  reaction: "🎵"
}, async (dest, zk, commandeOptions) => {
  const {  ms, arg } = commandeOptions;

  // Validate input
  if (!arg || !arg[0]) {
    return repondre(zk, dest, ms, 'Please provide a TikTok URL!');
  }

  const tiktokUrl = arg[0].trim();
  if (!tiktokUrl.includes('https://') || !(tiktokUrl.includes('tiktok.com') || tiktokUrl.includes('vt.tiktok.com'))) {
    return repondre(zk, dest, ms, "Please provide a valid TikTok URL.");
  }

  try {
    // API endpoint
    const apiUrl = `https://apis-keith.vercel.app/download/tiktokdl?url=${encodeURIComponent(tiktokUrl)}`;
    
    // Fetch TikTok video data
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result) {
      return repondre(zk, dest, ms, "Could not retrieve video. The TikTok may be private or unavailable.");
    }

    const videoInfo = data.result;

    // Prepare common contextInfo
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'TikTok Downloader'}`,
        body: videoInfo.caption || 'TikTok Video',
        thumbnailUrl: videoInfo.thumbnail || conf.URL || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Prepare caption with options
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

    // Send the initial message with options
    const message = await zk.sendMessage(dest, {
      image: { url: videoInfo.thumbnail || conf.URL || '' },
      caption: caption,
      contextInfo: commonContextInfo
    }, { quoted: ms });

    const messageId = message.key.id;

    // Set up reply handler
    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        // Check if this is a reply to our initial message
        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation || 
                           messageContent.message.extendedTextMessage?.text;

        // Validate response
        if (!['1', '2', '3', '4'].includes(responseText)) {
          return await zk.sendMessage(dest, {
            text: "Invalid option. Please reply with a number between 1-4.",
            quoted: messageContent
          });
        }

        // Send loading reaction
        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        // Handle different download options
        switch(responseText) {
          case '1': // Video (No Watermark)
            await zk.sendMessage(dest, {
              video: { url: videoInfo.nowm },
              caption: `*${conf.BOT || 'TikTok Downloader'}* - Video (No Watermark)\n${videoInfo.caption || ''}`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '2': // Video as Document
            await zk.sendMessage(dest, {
              document: { url: videoInfo.nowm },
              mimetype: "video/mp4",
              fileName: `${conf.BOT || 'TikTok'}_${Date.now()}.mp4`,
              caption: `*${conf.BOT || 'TikTok Downloader'}* - Video Document\n${videoInfo.caption || ''}`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '3': // Audio Only
            await zk.sendMessage(dest, {
              audio: { url: videoInfo.mp3 },
              mimetype: "audio/mpeg",
              caption: `*${conf.BOT || 'TikTok Downloader'}* - Audio\n${videoInfo.caption || ''}`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
            
          case '4': // Audio as Document
            await zk.sendMessage(dest, {
              document: { url: videoInfo.mp3 },
              mimetype: "audio/mpeg",
              fileName: `${conf.BOT || 'TikTok'}_${Date.now()}.mp3`,
              caption: `*${conf.BOT || 'TikTok Downloader'}* - Audio Document\n${videoInfo.caption || ''}`,
              contextInfo: commonContextInfo
            }, { quoted: messageContent });
            break;
        }

        // Send completion reaction
        await zk.sendMessage(dest, {
          react: { text: '✅', key: messageContent.key },
        });

      } catch (error) {
        console.error("Error handling reply:", error);
        await zk.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: messageContent
        });
      }
    };

    // Add event listener for replies
    zk.ev.on("messages.upsert", replyHandler);

    // Remove listener after 5 minutes to prevent memory leaks
    setTimeout(() => {
      zk.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("TikTok download error:", error);
    repondre(zk, dest, ms, `Failed to download TikTok. Error: ${error.message}\nYou can try with another link or check if the video is public.`);
  }
});

keith({
  nomCom: "mediafire",
  aliases: ["mfire", "mfdl", "mediafiredl"],
  categorie: "Download",
  reaction: "📦"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  // Validate input
  if (!arg || !arg[0]) {
    return repondre(zk, dest, ms, 'Please provide a MediaFire URL!');
  }

  const mediafireUrl = arg[0].trim();
  if (!mediafireUrl.includes('https://') || !mediafireUrl.includes('mediafire.com')) {
    return repondre(zk, dest, ms, "Please provide a valid MediaFire URL.");
  }

  try {
    // API endpoint
    const apiUrl = `https://apis-keith.vercel.app/download/mfire?url=${encodeURIComponent(mediafireUrl)}`;
    
    // Fetch MediaFire file data
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result || !data.result.dl_link) {
      return repondre(zk, dest, ms, "Could not retrieve file. The link may be invalid or the file unavailable.");
    }

    const fileInfo = data.result;

    // Prepare contextInfo
    const contextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'MediaFire Downloader'}`,
        body: `Downloading: ${fileInfo.fileName}`,
        thumbnailUrl: conf.URL || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    };

    // Prepare file info message
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

    // Send file info first
    await zk.sendMessage(dest, {
      text: fileInfoMessage,
      contextInfo: contextInfo
    }, { quoted: ms });

    // Send the file directly without reply options
    await zk.sendMessage(dest, {
      document: {
        url: fileInfo.dl_link
      },
      mimetype: fileInfo.fileType,
      fileName: fileInfo.fileName,
      caption: `*${conf.BOT || 'MediaFire Downloader'}*\nHere's your requested file: ${fileInfo.fileName}`,
      contextInfo: contextInfo
    });

  } catch (error) {
    console.error("MediaFire download error:", error);
    repondre(zk, dest, ms, `Failed to download file. Error: ${error.message}\nPlease check the link and try again.`);
  }
});


keith({
  nomCom: "hentaivid",
  aliases: ["hvid", "hentaidl", "hv"],
  categorie: "download",
  reaction: "🔞"
}, async (dest, zk, commandeOptions) => {
  const {  ms, arg } = commandeOptions;

  try {
    // API endpoint
    const apiUrl = 'https://apis-keith.vercel.app/dl/hentaivid';
    
    // Fetch hentai videos data
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.result || data.result.length === 0) {
      return repondre(zk, dest, ms, "Could not retrieve videos. Please try again later.");
    }

    const videos = data.result.slice(0, 8); // Ensure max 8 videos

    // Prepare common contextInfo
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Hentai Downloader'}`,
        body: "Select a video (1-8)",
        thumbnailUrl: conf.URL || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    };

    // Prepare selection menu
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

    // Send the selection menu
    const message = await zk.sendMessage(dest, {
      text: caption,
      contextInfo: commonContextInfo
    }, { quoted: ms });

    const messageId = message.key.id;

    // Set up reply handler
    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        // Check if this is a reply to our initial message
        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation || 
                           messageContent.message.extendedTextMessage?.text;

        // Validate response
        const selectedNum = parseInt(responseText);
        if (isNaN(selectedNum) || selectedNum < 1 || selectedNum > videos.length) {
          return await zk.sendMessage(dest, {
            text: `Invalid selection. Please reply with a number between 1-${videos.length}.`,
            quoted: messageContent
          });
        }

        const selectedVideo = videos[selectedNum - 1];

        // Send loading reaction
        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        // Send the selected video
        await zk.sendMessage(dest, {
          video: { url: selectedVideo.media.video_url },
          caption: `*${selectedVideo.title}*\nCategory: ${selectedVideo.category}\nViews: ${selectedVideo.views_count} | Shares: ${selectedVideo.share_count}`,
          contextInfo: commonContextInfo
        }, { quoted: messageContent });

        // Send completion reaction
        await zk.sendMessage(dest, {
          react: { text: '✅', key: messageContent.key },
        });

      } catch (error) {
        console.error("Error handling reply:", error);
        await zk.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: messageContent
        });
      }
    };

    // Add event listener for replies
    zk.ev.on("messages.upsert", replyHandler);

    // Remove listener after 5 minutes to prevent memory leaks
    setTimeout(() => {
      zk.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("Hentai video download error:", error);
    repondre(zk, dest, ms, `Failed to fetch videos. Error: ${error.message}`);
  }
});


keith({
  nomCom: "ytmp3",
  aliases: ["ytsearch", "ytdl", "youtube"],
  categorie: "Download",
  reaction: "🎵"
}, async (dest, zk, commandeOptions) => {
  const {  ms, arg } = commandeOptions;

  // Validate input
  if (!arg || !arg[0]) {
    return repondre(zk, dest, ms, 'Please provide a search query or YouTube URL!\nExample: .youtube Alan Walker Faded');
  }

  const query = arg.join(' ').trim();

  try {
    // Check if it's a URL or search query
    if (query.includes('youtube.com') || query.includes('youtu.be')) {
      // Direct URL download
      const apiUrl = `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.status || !data.result) {
        return repondre(zk, dest, ms, "Could not download audio. The video may be unavailable.");
      }

      const audioInfo = data.result;

      await zk.sendMessage(dest, {
        audio: { url: audioInfo.downloadUrl },
        mimetype: "audio/mpeg",
        fileName: `${audioInfo.title}.mp3`.replace(/[^\w\s.-]/gi, ''),
        caption: `*${conf.BOT || 'YouTube Downloader'}*\nTitle: ${audioInfo.title}\nQuality: ${audioInfo.quality}`,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            title: `${conf.BOT || 'YouTube Downloader'}`,
            body: audioInfo.title,
            thumbnailUrl: conf.URL || '',
            sourceUrl: conf.GURL || '',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: ms });

    } else {
      // Search YouTube
      const searchUrl = `https://apis.davidcyriltech.my.id/youtube/search?query=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl);
      const searchData = response.data;

      if (!searchData.status || !searchData.results || searchData.results.length === 0) {
        return repondre(zk, dest, ms, "No search results found. Try a different query.");
      }

      const videos = searchData.results.slice(0, 10); // Get top 10 results

      // Prepare search results list
      let resultsList = `*${conf.BOT || 'YouTube Search Results'}*\n`;
      resultsList += `Query: "${query}"\n\n`;
      resultsList += videos.map((video, index) => 
        `${index+1}. ${video.title}\n   ⏱️ ${video.duration} | 👀 ${formatViews(video.views)} | 📅 ${video.published}`
      ).join('\n\n');
      resultsList += '\n\nReply with the number of the video you want to download';

      // Send search results
      const message = await zk.sendMessage(dest, {
        text: resultsList,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            title: `${conf.BOT || 'YouTube Search'}`,
            body: `Results for: ${query}`,
            thumbnailUrl: videos[0].thumbnail || conf.URL || '',
            sourceUrl: conf.GURL || '',
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: ms });

      const messageId = message.key.id;

      // Set up reply handler
      const replyHandler = async (update) => {
        try {
          const messageContent = update.messages[0];
          if (!messageContent.message) return;

          // Check if this is a reply to our search results
          const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
          if (!isReply) return;

          const responseText = messageContent.message.conversation || 
                             messageContent.message.extendedTextMessage?.text;

          // Validate response
          const selectedIndex = parseInt(responseText) - 1;
          if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= videos.length) {
            return await zk.sendMessage(dest, {
              text: `Please reply with a number between 1-${videos.length}.`,
              quoted: messageContent
            });
          }

          const selectedVideo = videos[selectedIndex];

          // Send loading reaction
          await zk.sendMessage(dest, {
            react: { text: '⬇️', key: messageContent.key },
          });

          // Download the selected video's audio
          const downloadUrl = `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(selectedVideo.url)}`;
          const downloadResponse = await axios.get(downloadUrl);
          const downloadData = downloadResponse.data;

          if (!downloadData.status || !downloadData.result) {
            return await zk.sendMessage(dest, {
              text: "Failed to download this video. Please try another one.",
              quoted: messageContent
            });
          }

          const audioInfo = downloadData.result;

          await zk.sendMessage(dest, {
            audio: { url: audioInfo.downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${audioInfo.title}.mp3`.replace(/[^\w\s.-]/gi, ''),
            caption: `*${conf.BOT || 'YouTube Downloader'}*\nTitle: ${audioInfo.title}\nQuality: ${audioInfo.quality}`,
            contextInfo: {
              externalAdReply: {
                showAdAttribution: true,
                title: `${conf.BOT || 'YouTube Downloader'}`,
                body: audioInfo.title,
                thumbnailUrl: selectedVideo.thumbnail || conf.URL || '',
                sourceUrl: conf.GURL || '',
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: messageContent });

          // Remove listener after successful download
          zk.ev.off("messages.upsert", replyHandler);

        } catch (error) {
          console.error("Error handling YouTube download:", error);
          await zk.sendMessage(dest, {
            text: "An error occurred while processing your request. Please try again.",
            quoted: messageContent
          });
        }
      };

      // Add event listener for replies
      zk.ev.on("messages.upsert", replyHandler);

      // Remove listener after 5 minutes to prevent memory leaks
      setTimeout(() => {
        zk.ev.off("messages.upsert", replyHandler);
      }, 300000);
    }

  } catch (error) {
    console.error("YouTube error:", error);
    repondre(zk, dest, ms, `Failed to process YouTube request. Error: ${error.message}`);
  }
});

// Helper function to format view counts
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


keith({
  nomCom: "youtube",
  aliases: ["yt", "ytdl", "youtubedl"],
  categorie: "Download",
  reaction: "🎬"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  // Validate input
  if (!arg || arg.length < 1) {
    return repondre(zk, dest, ms, 'Usage:\n.yt [URL or search query]\nExample:\n.yt Alan Walker Faded\n.yt https://youtu.be/2WmBa1CviYE');
  }

  const query = arg.join(' ').trim();

  try {
    if (query.includes('youtube.com') || query.includes('youtu.be')) {
      // Direct URL - ask for media type
      const typeSelectionMsg = `
╭══════⊷
║ *${conf.BOT || 'YouTube Downloader'}*
║ Reply to select your media type
║  1. Video 
║  2. Audio
╰═══════⊷
      `;

      const message = await zk.sendMessage(dest, {
        text: typeSelectionMsg,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            title: `${conf.BOT || 'YouTube Downloader'}`,
            body: "Select download type",
            thumbnailUrl: conf.URL || '',
            sourceUrl: conf.GURL || '',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: ms });

      const messageId = message.key.id;

      // Set up reply handler for type selection
      const typeHandler = async (update) => {
        try {
          const messageContent = update.messages[0];
          if (!messageContent.message) return;

          // Check if this is a reply to our type selection message
          const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
          if (!isReply) return;

          const responseText = messageContent.message.conversation || 
                             messageContent.message.extendedTextMessage?.text;

          // Validate response
          if (!['1', '2'].includes(responseText)) {
            return await zk.sendMessage(dest, {
              text: "Please reply with 1 for Video or 2 for Audio.",
              quoted: messageContent
            });
          }

          const type = responseText === '1' ? 'video' : 'audio';
          const apiEndpoint = type === 'video' ? 'dlmp4' : 'dlmp3';
          
          // Send loading reaction
          await zk.sendMessage(dest, {
            react: { text: '⬇️', key: messageContent.key },
          });

          // Download the media
          const apiUrl = `https://apis-keith.vercel.app/download/${apiEndpoint}?url=${encodeURIComponent(query)}`;
          const response = await axios.get(apiUrl);
          const data = response.data;

          if (!data.status || !data.result) {
            return await zk.sendMessage(dest, {
              text: `Could not download ${type}. The video may be unavailable.`,
              quoted: messageContent
            });
          }

          const mediaInfo = data.result;
          const fileType = type === 'video' ? 'video/mp4' : 'audio/mpeg';
          const fileName = `${mediaInfo.title}.${type === 'video' ? 'mp4' : 'mp3'}`.replace(/[^\w\s.-]/gi, '');

          await zk.sendMessage(dest, {
            [type === 'video' ? 'video' : 'audio']: { url: mediaInfo.downloadUrl },
            mimetype: fileType,
            fileName: fileName,
            caption: `*${conf.BOT || 'YouTube Downloader'}*\nTitle: ${mediaInfo.title}\nQuality: ${mediaInfo.quality || 'N/A'}`,
            contextInfo: {
              externalAdReply: {
                showAdAttribution: true,
                title: `${conf.BOT || 'YouTube Downloader'}`,
                body: mediaInfo.title,
                thumbnailUrl: conf.URL || '',
                sourceUrl: conf.GURL || '',
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: messageContent });

          // Remove listener after successful download
          zk.ev.off("messages.upsert", typeHandler);

        } catch (error) {
          console.error("Error handling YouTube download:", error);
          await zk.sendMessage(dest, {
            text: "An error occurred while processing your request. Please try again.",
            quoted: messageContent
          });
        }
      };

      // Add event listener for type selection
      zk.ev.on("messages.upsert", typeHandler);

      // Remove listener after 5 minutes to prevent memory leaks
      setTimeout(() => {
        zk.ev.off("messages.upsert", typeHandler);
      }, 300000);

    } else {
      // Search YouTube
      const searchUrl = `https://apis.davidcyriltech.my.id/youtube/search?query=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl);
      const searchData = response.data;

      if (!searchData.status || !searchData.results || searchData.results.length === 0) {
        return repondre(zk, dest, ms, "No search results found. Try a different query.");
      }

      const videos = searchData.results.slice(0, 10); // Get top 10 results

      // Prepare search results list
      let resultsList = `*${conf.BOT || 'YouTube Search Results'}*\n`;
      resultsList += `Query: "${query}"\n\n`;
      resultsList += videos.map((video, index) => 
        `${index+1}. ${video.title}\n   ⏱️ ${video.duration} | 👀 ${formatViews(video.views)} | 📅 ${video.published}`
      ).join('\n\n');
      resultsList += '\n\nReply with the number of the video you want to download';

      // Send search results
      const message = await zk.sendMessage(dest, {
        text: resultsList,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            title: `${conf.BOT || 'YouTube Search'}`,
            body: `Results for: ${query}`,
            thumbnailUrl: videos[0].thumbnail || conf.URL || '',
            sourceUrl: conf.GURL || '',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: ms });

      const messageId = message.key.id;

      // Set up reply handler for video selection
      const videoHandler = async (update) => {
        try {
          const messageContent = update.messages[0];
          if (!messageContent.message) return;

          // Check if this is a reply to our search results
          const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
          if (!isReply) return;

          const responseText = messageContent.message.conversation || 
                             messageContent.message.extendedTextMessage?.text;

          // Validate response
          const selectedIndex = parseInt(responseText) - 1;
          if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= videos.length) {
            return await zk.sendMessage(dest, {
              text: `Please reply with a number between 1-${videos.length}.`,
              quoted: messageContent
            });
          }

          const selectedVideo = videos[selectedIndex];

          // Ask for media type
          const typeSelectionMsg = `
╭══════⊷
║ *${conf.BOT || 'YouTube Downloader'}*
║ Selected: ${selectedVideo.title}
║ Reply to select media type:
║  1. Video 
║  2. Audio
╰═══════⊷
          `;

          const typeMessage = await zk.sendMessage(dest, {
            text: typeSelectionMsg,
            contextInfo: {
              externalAdReply: {
                showAdAttribution: true,
                title: `${conf.BOT || 'YouTube Downloader'}`,
                body: selectedVideo.title,
                thumbnailUrl: selectedVideo.thumbnail || conf.URL || '',
                sourceUrl: conf.GURL || '',
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: messageContent });

          const typeMessageId = typeMessage.key.id;

          // Set up reply handler for type selection
          const typeHandler = async (update) => {
            try {
              const typeContent = update.messages[0];
              if (!typeContent.message) return;

              // Check if this is a reply to our type selection message
              const isTypeReply = typeContent.message.extendedTextMessage?.contextInfo?.stanzaId === typeMessageId;
              if (!isTypeReply) return;

              const typeResponse = typeContent.message.conversation || 
                                 typeContent.message.extendedTextMessage?.text;

              // Validate response
              if (!['1', '2'].includes(typeResponse)) {
                return await zk.sendMessage(dest, {
                  text: "Please reply with 1 for Video or 2 for Audio.",
                  quoted: typeContent
                });
              }

              const type = typeResponse === '1' ? 'video' : 'audio';
              const apiEndpoint = type === 'video' ? 'dlmp4' : 'dlmp3';
              
              // Send loading reaction
              await zk.sendMessage(dest, {
                react: { text: '⬇️', key: typeContent.key },
              });

              // Download the selected media
              const downloadUrl = `https://apis-keith.vercel.app/download/${apiEndpoint}?url=${encodeURIComponent(selectedVideo.url)}`;
              const downloadResponse = await axios.get(downloadUrl);
              const downloadData = downloadResponse.data;

              if (!downloadData.status || !downloadData.result) {
                return await zk.sendMessage(dest, {
                  text: `Failed to download ${type} for this video. Please try another one.`,
                  quoted: typeContent
                });
              }

              const mediaInfo = downloadData.result;
              const fileType = type === 'video' ? 'video/mp4' : 'audio/mpeg';
              const fileName = `${mediaInfo.title}.${type === 'video' ? 'mp4' : 'mp3'}`.replace(/[^\w\s.-]/gi, '');

              await zk.sendMessage(dest, {
                [type === 'video' ? 'video' : 'audio']: { url: mediaInfo.downloadUrl },
                mimetype: fileType,
                fileName: fileName,
                caption: `*${conf.BOT || 'YouTube Downloader'}*\nTitle: ${mediaInfo.title}\nQuality: ${mediaInfo.quality || 'N/A'}`,
                contextInfo: {
                  externalAdReply: {
                    showAdAttribution: true,
                    title: `${conf.BOT || 'YouTube Downloader'}`,
                    body: mediaInfo.title,
                    thumbnailUrl: selectedVideo.thumbnail || conf.URL || '',
                    sourceUrl: conf.GURL || '',
                    mediaType: 1,
                    renderLargerThumbnail: true
                  }
                }
              }, { quoted: typeContent });

              // Remove both handlers after successful download
              zk.ev.off("messages.upsert", videoHandler);
              zk.ev.off("messages.upsert", typeHandler);

            } catch (error) {
              console.error("Error handling YouTube download:", error);
              await zk.sendMessage(dest, {
                text: "An error occurred while processing your request. Please try again.",
                quoted: typeContent
              });
            }
          };

          // Add event listener for type selection
          zk.ev.on("messages.upsert", typeHandler);

          // Remove both handlers after 5 minutes to prevent memory leaks
          setTimeout(() => {
            zk.ev.off("messages.upsert", videoHandler);
            zk.ev.off("messages.upsert", typeHandler);
          }, 300000);

        } catch (error) {
          console.error("Error handling YouTube selection:", error);
          await zk.sendMessage(dest, {
            text: "An error occurred while processing your request. Please try again.",
            quoted: messageContent
          });
        }
      };

      // Add event listener for video selection
      zk.ev.on("messages.upsert", videoHandler);

      // Remove listener after 5 minutes to prevent memory leaks
      setTimeout(() => {
        zk.ev.off("messages.upsert", videoHandler);
      }, 300000);
    }

  } catch (error) {
    console.error("YouTube error:", error);
    repondre(zk, dest, ms, `Failed to process YouTube request. Error: ${error.message}`);
  }
});

// Helper function to format view counts
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


keith({
  nomCom: "ytmp4",
  aliases: ["yt", "ytdl", "youtubedl"],
  categorie: "Download",
  reaction: "🎬"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  // Validate input
  if (!arg || arg.length < 1) {
    return repondre(zk, dest, ms, 'Usage:\n.yt [video/audio] [URL or search query]\nExample:\n.yt video Alan Walker Faded\n.yt audio https://youtu.be/2WmBa1CviYE');
  }

  const type = arg[0].toLowerCase();
  const query = arg.slice(1).join(' ').trim();

  if (!['video', 'audio'].includes(type)) {
    return repondre(zk, dest, ms, 'Please specify "video" or "audio" as first argument');
  }

  if (!query) {
    return repondre(zk, dest, ms, 'Please provide a search query or YouTube URL');
  }

  try {
    if (query.includes('youtube.com') || query.includes('youtu.be')) {
      // Direct URL download
      const apiEndpoint = type === 'video' ? 'dlmp4' : 'dlmp3';
      const apiUrl = `https://apis-keith.vercel.app/download/${apiEndpoint}?url=${encodeURIComponent(query)}`;
      
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.status || !data.result) {
        return repondre(zk, dest, ms, `Could not download ${type}. The video may be unavailable.`);
      }

      const mediaInfo = data.result;
      const fileType = type === 'video' ? 'video/mp4' : 'audio/mpeg';
      const fileName = `${mediaInfo.title}.${type === 'video' ? 'mp4' : 'mp3'}`.replace(/[^\w\s.-]/gi, '');

      await zk.sendMessage(dest, {
        [type === 'video' ? 'video' : 'audio']: { url: mediaInfo.downloadUrl },
        mimetype: fileType,
        fileName: fileName,
        caption: `*${conf.BOT || 'YouTube Downloader'}*\nTitle: ${mediaInfo.title}\nQuality: ${mediaInfo.quality || 'N/A'}`,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            title: `${conf.BOT || 'YouTube Downloader'}`,
            body: mediaInfo.title,
            thumbnailUrl: conf.URL || '',
            sourceUrl: conf.GURL || '',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: ms });

    } else {
      // Search YouTube
      const searchUrl = `https://apis.davidcyriltech.my.id/youtube/search?query=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl);
      const searchData = response.data;

      if (!searchData.status || !searchData.results || searchData.results.length === 0) {
        return repondre(zk, dest, ms, "No search results found. Try a different query.");
      }

      const videos = searchData.results.slice(0, 10); // Get top 10 results

      // Prepare search results list
      let resultsList = `*${conf.BOT || 'YouTube Search Results'}*\n`;
      resultsList += `Query: "${query}"\nDownload Type: ${type}\n\n`;
      resultsList += videos.map((video, index) => 
        `${index+1}. ${video.title}\n   ⏱️ ${video.duration} | 👀 ${formatViews(video.views)} | 📅 ${video.published}`
      ).join('\n\n');
      resultsList += '\n\nReply with the number of the video you want to download';

      // Send search results
      const message = await zk.sendMessage(dest, {
        text: resultsList,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            title: `${conf.BOT || 'YouTube Search'}`,
            body: `Results for: ${query}`,
            thumbnailUrl: videos[0].thumbnail || conf.URL || '',
            sourceUrl: conf.GURL || '',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: ms });

      const messageId = message.key.id;

      // Set up reply handler
      const replyHandler = async (update) => {
        try {
          const messageContent = update.messages[0];
          if (!messageContent.message) return;

          // Check if this is a reply to our search results
          const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
          if (!isReply) return;

          const responseText = messageContent.message.conversation || 
                             messageContent.message.extendedTextMessage?.text;

          // Validate response
          const selectedIndex = parseInt(responseText) - 1;
          if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= videos.length) {
            return await zk.sendMessage(dest, {
              text: `Please reply with a number between 1-${videos.length}.`,
              quoted: messageContent
            });
          }

          const selectedVideo = videos[selectedIndex];

          // Send loading reaction
          await zk.sendMessage(dest, {
            react: { text: '⬇️', key: messageContent.key },
          });

          // Download the selected video
          const apiEndpoint = type === 'video' ? 'dlmp4' : 'dlmp3';
          const downloadUrl = `https://apis-keith.vercel.app/download/${apiEndpoint}?url=${encodeURIComponent(selectedVideo.url)}`;
          const downloadResponse = await axios.get(downloadUrl);
          const downloadData = downloadResponse.data;

          if (!downloadData.status || !downloadData.result) {
            return await zk.sendMessage(dest, {
              text: `Failed to download ${type} for this video. Please try another one.`,
              quoted: messageContent
            });
          }

          const mediaInfo = downloadData.result;
          const fileType = type === 'video' ? 'video/mp4' : 'audio/mpeg';
          const fileName = `${mediaInfo.title}.${type === 'video' ? 'mp4' : 'mp3'}`.replace(/[^\w\s.-]/gi, '');

          await zk.sendMessage(dest, {
            [type === 'video' ? 'video' : 'audio']: { url: mediaInfo.downloadUrl },
            mimetype: fileType,
            fileName: fileName,
            caption: `*${conf.BOT || 'YouTube Downloader'}*\nTitle: ${mediaInfo.title}\nQuality: ${mediaInfo.quality || 'N/A'}`,
            contextInfo: {
              externalAdReply: {
                showAdAttribution: true,
                title: `${conf.BOT || 'YouTube Downloader'}`,
                body: mediaInfo.title,
                thumbnailUrl: selectedVideo.thumbnail || conf.URL || '',
                sourceUrl: conf.GURL || '',
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: messageContent });

          // Remove listener after successful download
          zk.ev.off("messages.upsert", replyHandler);

        } catch (error) {
          console.error("Error handling YouTube download:", error);
          await zk.sendMessage(dest, {
            text: "An error occurred while processing your request. Please try again.",
            quoted: messageContent
          });
        }
      };

      // Add event listener for replies
      zk.ev.on("messages.upsert", replyHandler);

      // Remove listener after 5 minutes to prevent memory leaks
      setTimeout(() => {
        zk.ev.off("messages.upsert", replyHandler);
      }, 300000);
    }

  } catch (error) {
    console.error("YouTube error:", error);
    repondre(zk, dest, ms, `Failed to process YouTube request. Error: ${error.message}`);
  }
});

// Helper function to format view counts
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
