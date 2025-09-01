const fs = require("fs");
const path = require("path");

module.exports = {
  name: "adminlist",
  aliases: ["admins", "owner"],
  description: "Show the list of bot admins and owner",
  author: "Aminul Sardar",
  version: "1.0.0",

  async execute(bot, msg) {
    const chatId = msg.chat.id;
    const configPath = path.join(__dirname, "..", "config.json");

    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      const ownerID = config.ownerID;
      const adminIDs = config.botAdmins || [];

      const ownerInfo = `👤 *Owner ID:* \`${ownerID}\``;
      const adminList =
        adminIDs.length > 0
          ? adminIDs.map((id, i) => `🔹 Admin ${i + 1}: \`${id}\``).join("\n")
          : "⚠️ No other admins set.";

      const message = `🛡️ *Bot Access Control*
━━━━━━━━━━━━━━━━━━━━━━
${ownerInfo}
${adminList}
━━━━━━━━━━━━━━━━━━━━━━
👑 Only the owner and listed admins can use admin-only commands.`;

      bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    } catch (err) {
      console.error("adminlist.js error:", err.message);
      bot.sendMessage(chatId, "❌ Couldn't load admin list. Check your config file.");
    }
  }
};
