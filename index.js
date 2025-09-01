// ====== Stylish Telegram Bot (Serverless, Vercel Ready) ======
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const figlet = require("figlet");
const gradient = require("gradient-string");
const boxen = require("boxen");
const TelegramBot = require("node-telegram-bot-api");

// === Load Config ===
function loadConfig(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(chalk.red(`❌ Missing ${filePath}!`));
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error(chalk.red(`❌ Error parsing ${filePath}:`), err);
    return {};
  }
}

const config = loadConfig("./config.json");
const { botPrefix = "/", botAdmins = [], ownerID, botName = "TelegramBot", token } = config;

if (!token) {
  console.error(chalk.red("❌ Telegram bot token missing in config.json!"));
}

// === Global Stores ===
global.commands = global.commands || new Map();
global.aliases = global.aliases || new Map();

// === Load Commands ===
function loadCommands() {
  if (global.commands.size) return;

  const commandsPath = path.join(process.cwd(), "cmds");
  if (!fs.existsSync(commandsPath)) {
    console.log(chalk.yellow("⚠️  'cmds' directory not found."));
    return;
  }

  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd.name && typeof cmd.execute === "function") {
      global.commands.set(cmd.name, cmd);
      (cmd.aliases || []).forEach(alias => global.aliases.set(alias, cmd.name));
      console.log(chalk.green(`📦 Loaded command:`), chalk.cyan(cmd.name));
    }
  }

  console.log(chalk.blueBright(`✅ Total Commands Loaded: ${global.commands.size}`));
}

// === Init Bot (webhook mode) ===
let bot;
if (!global.botInstance && token) {
  bot = new TelegramBot(token, { webHook: true });
  global.botInstance = bot;

  const webhookUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/index`
    : `http://localhost:3000/api/index`;

  bot.setWebHook(webhookUrl).then(() => {
    const banner = gradient.rainbow(
      figlet.textSync(botName, { horizontalLayout: "full" })
    );

    console.log(banner);
    console.log(
      boxen(
        `${chalk.green("🤖 Bot Name:")} ${chalk.cyan(botName)}\n` +
        `${chalk.green("🌍 Webhook:")} ${chalk.yellow(webhookUrl)}`,
        { padding: 1, margin: 1, borderStyle: "round", borderColor: "cyan" }
      )
    );
  });

  loadCommands();

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
      return bot.sendMessage(chatId, `❌ Command \`${cmdName}\` not found.`, { parse_mode: "Markdown" });
    }

    if (command.adminOnly && ![...botAdmins, String(ownerID)].includes(userId)) {
      return bot.sendMessage(chatId, "🚫 You don’t have permission to use this command.");
    }

    try {
      console.log(chalk.cyan(`⚡ Executing Command:`), chalk.yellow(cmdName), chalk.gray(`by ${msg.from.username || userId}`));
      await command.execute(bot, msg, args);
    } catch (err) {
      console.error(chalk.red(`❌ Error executing '${cmdName}':`), err);
      bot.sendMessage(chatId, `⚠️ An error occurred while executing \`${cmdName}\`.`);
    }
  });
} else {
  bot = global.botInstance;
}

// === Vercel API Handler ===
module.exports = async (req, res) => {
  // ✅ Ensure body is parsed
  if (req.method === "POST") {
    let body = req.body;
    if (!body) {
      try {
        body = JSON.parse(await new Promise(resolve => {
          let data = "";
          req.on("data", chunk => (data += chunk));
          req.on("end", () => resolve(data));
        }));
      } catch (e) {
        console.error("❌ Failed to parse body");
        return res.status(400).json({ ok: false, error: "Invalid JSON" });
      }
    }

    try {
      await bot.processUpdate(body);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error(chalk.red("❌ Error processing update:"), err);
      return res.status(500).json({ ok: false });
    }
  }

  // GET → status
  return res.status(200).json({
    bot: botName,
    status: "🟢 Running (serverless)",
    totalCommands: global.commands.size
  });
};
