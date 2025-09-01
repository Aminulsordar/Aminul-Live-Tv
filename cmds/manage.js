const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  name: "manage",
  aliases: ["install", "uninstall"],
  description: "Install or uninstall command files dynamically",
  author: "YourName",
  version: "1.0.0",

  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const action = args[0];
    const target = args[1];
    const input = args[2]; // Used only for install

    if (!action || !target) {
      return bot.sendMessage(chatId, "⚠️ Usage:\n/install <filename> <raw_js_url>\n/uninstall <filename>");
    }

    const filePath = path.join(__dirname, `${target}.js`);

    if (action === "install") {
      if (!input) return bot.sendMessage(chatId, "❌ Please provide the raw JavaScript URL.");
      try {
        const { data } = await axios.get(input);
        fs.writeFileSync(filePath, data);
        bot.sendMessage(chatId, `✅ Installed command: *${target}*`, { parse_mode: "Markdown" });
      } catch (err) {
        console.error("Install error:", err.message);
        bot.sendMessage(chatId, "❌ Installation failed.");
      }
    } else if (action === "uninstall") {
      try {
        if (!fs.existsSync(filePath)) return bot.sendMessage(chatId, "❌ Command not found.");
        fs.unlinkSync(filePath);
        bot.sendMessage(chatId, `🗑️ Uninstalled command: *${target}*`, { parse_mode: "Markdown" });
      } catch (err) {
        console.error("Uninstall error:", err.message);
        bot.sendMessage(chatId, "❌ Uninstallation failed.");
      }
    } else {
      bot.sendMessage(chatId, "❌ Unknown action. Use `install` or `uninstall`.");
    }
  }
};
