module.exports = {
  name: "ping",
  description: "Check bot latency",
  async execute(chatId, text, sendMessage) {
    await sendMessage(chatId, "🏓 Pong!");
  }
};
