const axios = require("axios");

module.exports = {
  name: "teach",
  aliases: ["learn"],
  description: "Add custom Q&A to the AI (Bangla supported)",
  author: "Aminul Sardar",
  version: "1.0.0",

  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const input = args.slice(1).join(" ").trim();

    // ✏️ Instruction Format
    if (!input.includes(" - ")) {
      return bot.sendMessage(
        chatId,
        "❌ সঠিক ফরম্যাট ব্যবহার করুন:\n\n/teach প্রশ্ন - উত্তর\n\nএকাধিক প্রশ্ন দিতে চাইলে '|' দিয়ে আলাদা করুন।\n\nExample:\n/teach কী খবর? | কেমন আছো? - ভালো আছি, ধন্যবাদ।"
      );
    }

    const qaText = input;

    try {
      // 📡 Send to teaching API
      const res = await axios.post(`https://jan-api-by-aminul-sordar.vercel.app/teach`, {
        text: qaText
      });

      const reply = res.data.message || "✅ শেখানো সম্পন্ন হয়েছে!";
      return bot.sendMessage(chatId, `📚 ${reply}`);
    } catch (e) {
      console.error("teachMultiple error:", e.message);
      return bot.sendMessage(chatId, "❌ শেখানো ব্যর্থ হয়েছে! সার্ভার সমস্যা হতে পারে।");
    }
  }
};
