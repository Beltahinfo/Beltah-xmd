const { keith } = require("../keizzah/keith");
const axios = require("axios");
const yts = require("yt-search");
const googleIt = require("google-it");

// YOUTUBE SEARCH
keith({
  nomCom: "ytsearch",
  categorie: "Search",
  reaction: "🔎",
  alias: ["yts", "ytfind"],
  description: "Search for YouTube videos."
}, async (_origineMessage, zk, { ms, arg, repondre }) => {
  const query = arg.join(" ");
  if (!query) return repondre("Please provide a search keyword.");
  try {
    const { videos } = await yts(query);
    if (!videos.length) return repondre("No results found.");
    let text = `🔎 *YouTube Search Results for:* _${query}_\n\n`;
    videos.slice(0, 5).forEach((video, i) => {
      text += `*${i + 1}.* [${video.title}](${video.url})\nDuration: ${video.timestamp} | Views: ${video.views.toLocaleString()}\nChannel: ${video.author.name}\n\n`;
    });
    await repondre(text);
  } catch (e) {
    await repondre("Error searching YouTube.");
  }
});

// GOOGLE SEARCH
keith({
  nomCom: "google",
  categorie: "Search",
  reaction: "🌐",
  alias: ["gsearch", "web"],
  description: "Search Google for your query."
}, async (_origineMessage, zk, { ms, arg, repondre }) => {
  const query = arg.join(" ");
  if (!query) return repondre("Please provide a search keyword.");
  try {
    const results = await googleIt({ query, limit: 5 });
    if (!results.length) return repondre("No results found.");
    let text = `🌐 *Google Search Results for:* _${query}_\n\n`;
    results.forEach((res, i) => {
      text += `*${i + 1}.* [${res.title}](${res.link})\n${res.snippet}\n\n`;
    });
    await repondre(text);
  } catch (e) {
    await repondre("Error performing Google search.");
  }
});

// WIKIPEDIA SEARCH
keith({
  nomCom: "wiki",
  categorie: "Search",
  reaction: "📚",
  alias: ["wikipedia"],
  description: "Search Wikipedia for your query."
}, async (_origineMessage, zk, { ms, arg, repondre }) => {
  const query = arg.join(" ");
  if (!query) return repondre("Please provide a search keyword.");
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const { data } = await axios.get(url);
    if (data.type === "https://mediawiki.org/wiki/HyperSwitch/errors/not_found") {
      return repondre("No Wikipedia article found.");
    }
    let reply = `*${data.title}*\n\n${data.extract}\n\nRead more: ${data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`}`;
    await repondre(reply);
  } catch (e) {
    await repondre("Error searching Wikipedia.");
  }
});

// LYRICS SEARCH
keith({
  nomCom: "lyrics",
  categorie: "Search",
  reaction: "🎤",
  alias: ["lyric", "songlyrics"],
  description: "Find lyrics for a song."
}, async (_origineMessage, zk, { ms, arg, repondre }) => {
  const query = arg.join(" ");
  if (!query) return repondre("Please provide a song name or artist.");
  try {
    const url = `https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url);
    let txt = `🎤 *${data.title}* by *${data.author}*\n\n${data.lyrics.substring(0, 3000)}${data.lyrics.length > 3000 ? "..." : ""}\n\nMore: ${data.links?.genius || ""}`;
    await repondre(txt);
  } catch {
    await repondre("Lyrics not found or error occurred.");
  }
});
