const fs = require("fs");
const path = require("path");

module.exports = {
  name: "prefix",
  aliases: [],
  description: "View or update the bot's command prefix and info panel",
  author: "Aminul Sardar",
  version: "1.2.0",

  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const userId = String(msg.from.id);
    const configPath = path.join(__dirname, "..", "config.json");

    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (err) {
      console.error("❌ Failed to load config.json:", err.message);
      return bot.sendMessage(chatId, "❌ Config file読み込みエラー。");
    }

    const currentPrefix = config.botPrefix || "/";
    const botLink = `https://t.me/${bot.username}`;
    const isAdmin = global.isAdmin?.(userId) || userId === config.ownerID;

    // No arguments: show info panel
    if (!args.length || args[0].toLowerCase() === "info") {
      const infoPanel = `🤖 𝐀𝐌𝐈𝐍𝐔𝐋-𝐁𝐎𝐓 Information Panel
━━━━━━━━━━━━━━━━━━━━━━
📍 *Current Prefix:* \`${currentPrefix}\`
🧠 *Bot Name:* ${config.botName || bot.username}
🆔 *Bot ID:* ${bot.id}
🔗 *Bot Link:* [Click Here](${botLink})
👤 *Owner ID:* \`${config.ownerID}\`
━━━━━━━━━━━━━━━━━━━━━━
✨ Powered by: *Aminul Sardar*`;

      return bot.sendMessage(chatId, infoPanel, {
        parse_mode: "Markdown",
        disable_web_page_preview: true
      });
    }

    // Change prefix (admin only)
    const newPrefix = args[0];

    if (!isAdmin) {
      return bot.sendMessage(chatId, "🚫 You don’t have permission to update the prefix.");
    }

    if (newPrefix.length > 2) {
      return bot.sendMessage(chatId, "⚠️ Prefix should be short (1–2 characters recommended).");
    }

    config.botPrefix = newPrefix;

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      bot.sendMessage(chatId, `✅ Prefix successfully updated to: \`${newPrefix}\``, {
        parse_mode: "Markdown"
      });
    } catch (err) {
      console.error("❌ Failed to save config.json:", err.message);
      bot.sendMessage(chatId, "❌ Prefix update failed.");
    }
  }
};
