const fs = require("fs");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

// === Load Config ===
function loadConfig(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`❌ Missing ${filePath}!`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const config = loadConfig("./config.json");
const { botPrefix = "/", botAdmins = [], ownerID, botName = "TelegramBot", token } = config;

if (!token) throw new Error("❌ Telegram bot token missing in config.json!");

// === Global Stores ===
global.commands = global.commands || new Map();
global.aliases = global.aliases || new Map();

// === Load Commands ===
function loadCommands() {
  if (global.commands.size) return; // prevent reloading every request

  const commandsPath = path.join(process.cwd(), "cmds");
  if (!fs.existsSync(commandsPath)) return;

  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd.name && typeof cmd.execute === "function") {
      global.commands.set(cmd.name, cmd);
      (cmd.aliases || []).forEach(alias => global.aliases.set(alias, cmd.name));
    }
  }
}

// === Init Telegram Bot with Webhook ===
const bot = new TelegramBot(token, { webHook: true });
const webhookUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}/api/index`
  : `http://localhost:3000/api/index`;

// Set webhook once
if (!global.webhookSet) {
  bot.setWebHook(webhookUrl);
  global.webhookSet = true;
  console.log(`🚀 Webhook set: ${webhookUrl}`);
}

loadCommands();

// === Vercel API Handler ===
module.exports = async (req, res) => {
  if (req.method === "POST") {
    try {
      await bot.processUpdate(req.body);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("❌ Error processing update:", err);
      return res.status(500).json({ ok: false });
    }
  }

  // GET → status check
  return res.status(200).json({
    bot: botName,
    status: "🟢 Running (serverless)",
    totalCommands: global.commands.size
  });
};

// === Handle Messages ===
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = String(msg.from.id);
  const text = msg.text?.trim() || "";

  if (!text.startsWith(botPrefix)) return;

  const args = text.slice(botPrefix.length).split(/\s+/);
  let cmdName = args.shift().toLowerCase();

  if (global.aliases.has(cmdName)) {
    cmdName = global.aliases.get(cmdName);
  }

  const command = global.commands.get(cmdName);

  if (!command) {
    return bot.sendMessage(chatId, `❌ Command \`${cmdName}\` not found.\nTry \`${botPrefix}help\`.`, {
      parse_mode: "Markdown"
    });
  }

  if (command.adminOnly && ![...botAdmins, String(ownerID)].includes(userId)) {
    return bot.sendMessage(chatId, "🚫 You don’t have permission to use this command.");
  }

  try {
    await command.execute(bot, msg, args);
  } catch (err) {
    console.error(`❌ Error executing '${cmdName}':`, err);
    bot.sendMessage(chatId, `⚠️ An error occurred while executing \`${cmdName}\`.`);
  }
});
