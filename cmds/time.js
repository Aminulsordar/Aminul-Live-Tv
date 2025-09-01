module.exports = {
  name: "time",
  aliases: ["clock"],
  description: "Get the current time",
  author: "YourName",
  version: "1.0.0",

  async execute(bot, msg) {
    const now = new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka" });
    bot.sendMessage(msg.chat.id, `🕒 Current time in Bangladesh:\n${now}`);
  }
};
