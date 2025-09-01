module.exports = {
  name: "test",
  aliases: ["ping", "check"],
  description: "Check if the bot is online",
  author: "YourName",
  version: "1.0.0",

  async execute(bot, msg) {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, "✅ Bot is online and responding!");
  }
};
