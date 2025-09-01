const fs = require("fs");
const path = require("path");

module.exports = {
  name: "help",
  description: "Show all available commands",
  async execute(chatId, text, sendMessage) {
    const commandsPath = path.join(__dirname);
    const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
    const cmds = files.map(f => "• /" + f.replace(".js", ""));
    await sendMessage(chatId, "📖 Available commands:\n" + cmds.join("\n"));
  }
};
