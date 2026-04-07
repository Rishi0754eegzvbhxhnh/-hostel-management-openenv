const TelegramBot = require('node-telegram-bot-api');
const newsService = require('./newsService');
const aiService = require('./aiService');

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;

/**
 * Initialize Telegram Bot
 */
function initializeBot() {
  if (!token || token === 'your_telegram_bot_token_here') {
    // Silently skip if not configured
    return false;
  }

  try {
    bot = new TelegramBot(token, { polling: true });
    console.log('✅ Telegram Bot initialized');
    
    setupBotCommands();
    return true;
  } catch (error) {
    console.error('❌ Telegram Bot initialization error:', error.message);
    return false;
  }
}

/**
 * Setup bot commands and message handlers
 */
function setupBotCommands() {
  if (!bot) return;

  // /start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🤖 Welcome to HostelOS News Bot!

I can help you stay updated with the latest news. Here's what I can do:

📰 /news - Get top headlines
💻 /tech - Technology news
⚽ /sports - Sports updates
🏥 /health - Health news
🔬 /science - Science discoveries
💼 /business - Business news
🎬 /entertainment - Entertainment news

📊 /digest - Get your daily news digest
🔍 /search <query> - Search for specific news

Just send me a message and I'll help you stay informed! 🌍
    `;
    bot.sendMessage(chatId, welcomeMessage);
  });

  // /news command - Top headlines
  bot.onText(/\/news/, async (msg) => {
    const chatId = msg.chat.id;
    await sendCategoryNews(chatId, 'top', '📰 Top Headlines');
  });

  // /tech command
  bot.onText(/\/tech/, async (msg) => {
    const chatId = msg.chat.id;
    await sendCategoryNews(chatId, 'technology', '💻 Technology News');
  });

  // /sports command
  bot.onText(/\/sports/, async (msg) => {
    const chatId = msg.chat.id;
    await sendCategoryNews(chatId, 'sports', '⚽ Sports News');
  });

  // /health command
  bot.onText(/\/health/, async (msg) => {
    const chatId = msg.chat.id;
    await sendCategoryNews(chatId, 'health', '🏥 Health News');
  });

  // /science command
  bot.onText(/\/science/, async (msg) => {
    const chatId = msg.chat.id;
    await sendCategoryNews(chatId, 'science', '🔬 Science News');
  });

  // /business command
  bot.onText(/\/business/, async (msg) => {
    const chatId = msg.chat.id;
    await sendCategoryNews(chatId, 'business', '💼 Business News');
  });

  // /entertainment command
  bot.onText(/\/entertainment/, async (msg) => {
    const chatId = msg.chat.id;
    await sendCategoryNews(chatId, 'entertainment', '🎬 Entertainment News');
  });

  // /digest command
  bot.onText(/\/digest/, async (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'Student';
    
    bot.sendMessage(chatId, '⏳ Generating your personalized digest...');
    
    try {
      const newsResult = await newsService.getTrendingNews(10);
      if (newsResult.success) {
        const digestResult = await aiService.generateDigest(newsResult.articles, userName);
        bot.sendMessage(chatId, digestResult.digest);
      } else {
        bot.sendMessage(chatId, '❌ Failed to fetch news. Please try again later.');
      }
    } catch (error) {
      bot.sendMessage(chatId, '❌ Error generating digest: ' + error.message);
    }
  });

  // /search command
  bot.onText(/\/search (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1];
    
    bot.sendMessage(chatId, `🔍 Searching for: "${query}"...`);
    
    try {
      const result = await newsService.searchNews(query, 5);
      if (result.success && result.articles.length > 0) {
        const message = formatNewsArticles(result.articles, `🔍 Search Results for "${query}"`);
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } else {
        bot.sendMessage(chatId, `No results found for "${query}"`);
      }
    } catch (error) {
      bot.sendMessage(chatId, '❌ Search error: ' + error.message);
    }
  });

  // Handle general messages
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.toLowerCase() || '';
    
    // Skip if it's a command
    if (text.startsWith('/')) return;
    
    // Detect news-related keywords
    if (text.includes('news') || text.includes('headline') || text.includes('update')) {
      bot.sendMessage(chatId, 'Use /news for top headlines or /digest for your daily digest! 📰');
    } else if (text.includes('tech') || text.includes('technology')) {
      bot.sendMessage(chatId, 'Use /tech for technology news! 💻');
    } else if (text.includes('sport')) {
      bot.sendMessage(chatId, 'Use /sports for sports updates! ⚽');
    } else {
      bot.sendMessage(chatId, 'Type /start to see all available commands! 🤖');
    }
  });
}

/**
 * Send category news to chat
 */
async function sendCategoryNews(chatId, category, title) {
  bot.sendMessage(chatId, '⏳ Fetching latest news...');
  
  try {
    const result = category === 'top'
      ? await newsService.getTrendingNews(5)
      : await newsService.getNewsByCategory(category, 5);
    
    if (result.success && result.articles.length > 0) {
      const message = formatNewsArticles(result.articles, title);
      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } else {
      bot.sendMessage(chatId, '❌ Failed to fetch news. Please try again later.');
    }
  } catch (error) {
    bot.sendMessage(chatId, '❌ Error: ' + error.message);
  }
}

/**
 * Format news articles for Telegram
 */
function formatNewsArticles(articles, title) {
  let message = `*${title}*\n\n`;
  
  articles.slice(0, 5).forEach((article, i) => {
    message += `${i + 1}. *${article.title}*\n`;
    if (article.description) {
      message += `   ${article.description.substring(0, 100)}...\n`;
    }
    message += `   📰 ${article.source}\n`;
    message += `   🔗 [Read more](${article.url})\n\n`;
  });
  
  return message;
}

/**
 * Send message to specific chat
 */
async function sendMessage(chatId, message) {
  if (!bot) {
    return { success: false, error: 'Bot not initialized' };
  }
  
  try {
    await bot.sendMessage(chatId, message);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  initializeBot,
  sendMessage,
  bot
};
