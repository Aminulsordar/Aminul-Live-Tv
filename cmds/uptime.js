const os = require("os");

module.exports = {
  name: "uptime",
  aliases: ["up"],
  usePrefix: false, 
  adminOnly: false,

  async execute(bot, msg, args) {
    const chatId = msg.chat.id;

    // Bot uptime
    const totalSeconds = process.uptime();
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    // System uptime
    const systemUptime = os.uptime();
    const sysHours = Math.floor(systemUptime / 3600);
    const sysMinutes = Math.floor((systemUptime % 3600) / 60);
    const sysSeconds = Math.floor(systemUptime % 60);

    // Current server time
    const currentTime = new Date().toLocaleString("en-BD", {
      timeZone: "Asia/Dhaka",
      hour12: true
    });

    const text = `
⏱ *Bot Uptime*
🕐 ${days}d ${hours}h ${minutes}m ${seconds}s

💻 *System Uptime*
⌛ ${sysHours}h ${sysMinutes}m ${sysSeconds}s

🗓 *Current Server Time*
📆 ${currentTime}
    `.trim();

    bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  }
};
