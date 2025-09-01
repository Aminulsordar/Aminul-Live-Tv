const axios = require("axios");

module.exports = {
  name: "jan",
  aliases: ["jaan", "love", "hi", "count", "teach"],
  adminOnly: false,
  description: "Sweet replies, Q&A system, and teaching ability via API",

  // === Fetch total Q&A count ===
  async fetchCount() {
    try {
      const res = await axios.get(`https://jan-api-by-aminul-sordar.vercel.app/count`);
      return res.data;
    } catch (e) {
      console.error("fetchCount error:", e.message);
      return { questions: 0, answers: 0 };
    }
  },

  // === Ask the bot (Q&A lookup) ===
  async getAnswer(question) {
    try {
      const res = await axios.get(`https://jan-api-by-aminul-sordar.vercel.app/answer/${encodeURIComponent(question)}`);
      return res.data.answer || "❌ আমি এখনো এটা শিখিনি, দয়া করে আমাকে শেখান! 👀";
    } catch (e) {
      console.error("getAnswer error:", e.message);
      return "❌ সার্ভার থেকে উত্তর পাওয়া যায়নি, পরে আবার চেষ্টা করুন!";
    }
  },

  async execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const body = msg.text?.trim() || "";
    const command = args[0]?.toLowerCase();

    // === Show Q&A Count ===
    if (command === "count" || body.toLowerCase().endsWith("count")) {
      const count = await this.fetchCount();
      return bot.sendMessage(chatId,
        `📊 *জ্ঞানভাণ্ডার:*\n\n` +
        `📌 মোট প্রশ্ন: *${count.questions}*\n` +
        `📌 মোট উত্তর: *${count.answers}*\n\n` +
        `💡 আমাকে আরও শেখানোর মাধ্যমে আরও স্মার্ট করুন!\n` +
        `🔍 কিছু প্রশ্ন করুন, আমি চেষ্টা করব উত্তর দেওয়ার!`,
        { parse_mode: "Markdown" }
      );
    }

    // === Teach new Q&A ===
    if (command === "teach") {
      const input = args.slice(1).join(" ").trim();

      if (!input.includes(" - ")) {
        return bot.sendMessage(chatId,
          "❌ সঠিক ফরম্যাট ব্যবহার করুন:\n\n/teach প্রশ্ন - উত্তর\n\nএকাধিক প্রশ্ন দিতে চাইলে '|' দিয়ে আলাদা করুন।\n\nউদাহরণ:\n/teach কেমন আছো? | কী খবর? - ভালো আছি, ধন্যবাদ!"
        );
      }

      try {
        const res = await axios.post(`https://jan-api-by-aminul-sordar.vercel.app/teach`, { text: input });
        return bot.sendMessage(chatId, `✅ ${res.data.message || "শেখানো সম্পন্ন হয়েছে!"}`);
      } catch (e) {
        console.error("teach error:", e.message);
        return bot.sendMessage(chatId, "❌ শেখানো ব্যর্থ হয়েছে! সার্ভার সমস্যা হতে পারে।");
      }
    }

    // === Try to answer taught Q&A ===
    const answer = await this.getAnswer(body);
    if (!answer.includes("❌")) {
      return bot.sendMessage(chatId, `🤖 ${answer}`);
    }

    // === Fallback: Random Sweet Reply ===
    const replies = [
      "হ্যাঁ 😀, আমি এখানে আছি",
      "কেমন আছো?",
      "বলো জান কি করতে পারি তোমার জন্য",
      `তুমি বলেছো: "${body}"? কিউট!`,
      "I love you 💝",
      "ভালোবাসি তোমাকে 🤖",
      "Hi, I'm messenger Bot, I can help you.?🤖",
      "Use callad to contact admin!",
      "Hi, Don't disturb 🤖 🚘 Now I'm going to Feni, Bangladesh..bye",
      "Hi, 🤖 I can help you~~~~",
      "আমি এখন আমিনুল বসের সাথে বিজি আছি",
      "আমাকে না ডেকে আমার বসকে ডাকো 👉 https://www.facebook.com/100071880593545",
      "Hmmm sona 🖤 meye hoile kule aso ar sele hoile kule new 🫂😘",
      "হা বলো, শুনছি আমি 🤸‍♂️🫂",
      "Ato daktasen kn bujhlam na 😡",
      "jan bal falaba,🙂",
      "ask amr mon vlo nei dakben na🙂",
      "Hmm jan ummah😘😘",
      "jang hanga korba 🙂🖤",
      "iss ato dako keno lojja lage to 🫦🙈",
      "suna tomare amar valo lage,🙈😽"
    ];

    const reply = replies[Math.floor(Math.random() * replies.length)];
    return bot.sendMessage(chatId, reply);
  }
};
