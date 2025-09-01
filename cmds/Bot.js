const axios = require("axios");

module.exports = {
  name: "bot",
  aliases: [],
  adminOnly: false,
  usePrefix: false, // Allow free text input without prefix
  description: "Teach new Q&A in natural style",

  // ===== Teach multiple questions at once =====
  async teachMultiple(qaText) {
    try {
      const res = await axios.post(`https://jan-api-by-aminul-sordar.vercel.app/teach`, {
        text: qaText
      });
      return res.data.message;
    } catch (e) {
      console.error("teachMultiple error:", e.message);
      return "❌ শেখানো ব্যর্থ হয়েছে! সার্ভার সমস্যা হতে পারে।";
    }
  },

  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const body = msg.text?.trim() || "";
    const command = args[0]?.toLowerCase();

    // === Handle "teach" command ===
    if (body.toLowerCase().startsWith("teach")) {
      const input = body.slice(5).trim(); // remove "teach" keyword

      if (!input.includes(" - ")) {
        return bot.sendMessage(chatId,
          "❌ সঠিক ফরম্যাট ব্যবহার করুন:\n`teach প্রশ্ন - উত্তর`\n\nএকাধিক প্রশ্ন দিতে চাইলে `|` দিয়ে আলাদা করুন।",
          { parse_mode: "Markdown" }
        );
      }

      const result = await this.teachMultiple(input);
      return bot.sendMessage(chatId, `✅ ${result}`);
    }

    // If not "teach", ignore silently or reply optionally
    // return bot.sendMessage(chatId, "🙂 Janu এখানে আছে, কিছু শেখাতে চাইলে 'teach প্রশ্ন - উত্তর' লিখো!");
  }
};
