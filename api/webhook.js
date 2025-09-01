const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const chalk = require("chalk");
const gradient = require("gradient-string");

// === Load Config ===
let config = {};
try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config.json"), "utf8"));
} catch (err) {
  console.error(chalk.red("❌ Failed to load config.json"), err);
}

const BOT_TOKEN = config.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const BOT_NAME = config.botName || "Telegram Bot";
const OWNER_ID = String(config.ownerID);
const ADMINS = config.botAdmins || [];

// === Helper: Send Message ===
async function sendMessage(chatId, text) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
  console.log(gradient.pastel(`📤 Replied to chat ${chatId}: ${text}`));
}

// === Load Commands Dynamically ===
const commands = {};
const commandsPath = path.join(__dirname, "../commands");
if (fs.existsSync(commandsPath)) {
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
  for (const file of files) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd.name) commands[cmd.name] = cmd;
    console.log(chalk.green(`📦 Loaded command: ${cmd.name}`));
  }
}

// === Webhook Handler ===
module.exports = async (req, res) => {
  try {
    if (req.method === "POST") {
      const body = req.body || {};
      if (body.message) {
        const chatId = body.message.chat.id;
        const userId = String(body.message.from.id);
        const text = body.message.text || "";

        console.log(chalk.cyan(`📥 Received message: ${text} (chat ${chatId})`));

        if (text.startsWith("/")) {
          const args = text.slice(1).split(/\s+/);
          const cmdName = args.shift().toLowerCase();

          if (commands[cmdName]) {
            // Admin-only check
            if (commands[cmdName].adminOnly && !ADMINS.includes(userId) && userId !== OWNER_ID) {
              return sendMessage(chatId, "🚫 You don't have permission to use this command.");
            }
            await commands[cmdName].execute(chatId, text, sendMessage);
          } else {
            await sendMessage(chatId, `❌ Unknown command: ${cmdName}`);
          }
        }
      }
      return res.status(200).json({ ok: true });
    }

    // GET → status
    return res.status(200).json({
      bot: BOT_NAME,
      status: "🟢 Running on Vercel",
      commands: Object.keys(commands)
    });
  } catch (err) {
    console.error(chalk.red(`❌ Error: ${err.message}`));
    return res.status(500).json({ error: err.message });
  }
};
