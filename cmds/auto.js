const axios = require("axios");
const fs = require("fs");
const request = require("request");
const path = require("path");

module.exports = {
  name: "auto",
  aliases: [],
  description: "Automatically download videos from links sent in messages",
  author: "Aminul Sardar",
  version: "1.1.0",

  async execute(api, event) {
    const { threadID, messageID, body } = event;
    if (!body) return;

    const linkMatch = body.match(/(https?:\/\/[^\s]+)/);
    if (!linkMatch) return;

    const url = linkMatch[0];
    api.setMessageReaction("⏳", messageID, () => {}, true);

    const isYouTube = /(?:youtube\.com|youtu\.be)/.test(url);

    try {
      let videoUrl = null;
      let title = "📹 Untitled Video";

      if (isYouTube) {
        const ytRes = await axios.get(`https://aryan-xyz-ytdl-five.vercel.app/download?url=${encodeURIComponent(url)}`);
        if (!ytRes.data || !ytRes.data.url) {
          return api.sendMessage("❌ Failed to download YouTube video. Please try another link.", threadID, messageID);
        }
        videoUrl = ytRes.data.url;
        title = ytRes.data.title || "🎥 YouTube Video";
      } else {
        const otherRes = await axios.get(`https://aryan-video-downloader.vercel.app/alldl?url=${encodeURIComponent(url)}`);
        const data = otherRes.data.data || {};
        title = data.title || "📽️ Unknown Title";
        videoUrl = data.videoUrl || data.high || data.low || null;
      }

      if (!videoUrl) {
        return api.sendMessage("⚠️ Could not extract video URL. Try a different link.", threadID, messageID);
      }

      const fileName = `video_${Date.now()}.mp4`;
      const filePath = path.join(__dirname, "..", fileName);

      request(videoUrl)
        .pipe(fs.createWriteStream(filePath))
        .on("close", () => {
          api.setMessageReaction("✅", messageID, () => {}, true);
          api.sendMessage(
            {
              body: `🎉 *Download Complete!*\n📌 *Title:* ${title}`,
              attachment: fs.createReadStream(filePath)
            },
            threadID,
            () => fs.unlinkSync(filePath)
          );
        });
    } catch (err) {
      console.error("🔴 Download Error:", err.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      api.sendMessage("🚫 An error occurred while downloading. Please try again later.", threadID, messageID);
    }
  }
};
