module.exports = {
  name: "start",
  description: "Welcome message",
  async execute(chatId, text, sendMessage) {
    await sendMessage(chatId, "👋 হ্যালো! আমি Vercel-এ চলমান Telegram Bot 🚀");
  }
};
