# NewsData.io + AI + Messaging Bots Integration

## 📦 Installation

### Backend Dependencies
```bash
cd backend
npm install axios node-telegram-bot-api twilio
```

## 🔑 API Keys Setup

### 1. NewsData.io API
- Already configured: `pub_afcaf271fc224c099f62cba1c0c1682f`
- Free tier: 200 requests/day
- Docs: https://newsdata.io/documentation

### 2. OpenAI API (Optional - for AI summarization)
1. Sign up at https://platform.openai.com/
2. Create API key
3. Add to `backend/.env`: `OPENAI_API_KEY=sk-...`
4. Note: Without this, system uses fallback summarization

### 3. Telegram Bot
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow prompts to create bot
4. Copy the token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Add to `backend/.env`: `TELEGRAM_BOT_TOKEN=your_token_here`

### 4. Twilio WhatsApp (Optional)
1. Sign up at https://www.twilio.com/
2. Get WhatsApp Sandbox number
3. Add credentials to `backend/.env`:
   ```
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

## 🚀 Usage

### API Endpoints

#### Get News by Category
```bash
GET /api/news/category/:category?limit=10
```
Categories: `technology`, `sports`, `health`, `science`, `business`, `entertainment`

Example:
```bash
curl http://localhost:5000/api/news/category/technology
```

#### Get Trending News
```bash
GET /api/news/trending?limit=10
```

#### Search News
```bash
GET /api/news/search?q=artificial+intelligence&limit=10
```

#### Get AI Summary
```bash
GET /api/news/summary/:category?format=bullet
```
Formats: `bullet` or `paragraph`

#### Get Daily Digest
```bash
GET /api/news/digest?name=Rahul&category=technology
```

### Telegram Bot Commands

Once bot is running, users can:
- `/start` - Welcome message and help
- `/news` - Top headlines
- `/tech` - Technology news
- `/sports` - Sports updates
- `/health` - Health news
- `/science` - Science news
- `/business` - Business news
- `/entertainment` - Entertainment news
- `/digest` - Personalized daily digest
- `/search <query>` - Search for specific news

### WhatsApp Integration

Send messages programmatically:
```javascript
const whatsappService = require('./services/whatsappService');

await whatsappService.sendNewsDigest(
  '+919876543210', // recipient number
  'Your daily news digest...'
);
```

## 🔄 Automated Daily Digest

To send automated digests, add a cron job:

```javascript
const cron = require('node-cron');
const newsService = require('./services/newsService');
const aiService = require('./services/aiService');
const telegramService = require('./services/telegramService');

// Send digest every day at 8 AM
cron.schedule('0 8 * * *', async () => {
  const news = await newsService.getTrendingNews(10);
  const digest = await aiService.generateDigest(news.articles, 'Student');
  
  // Send to all subscribed users
  // (You'll need to store user chat IDs in database)
  await telegramService.sendMessage(chatId, digest.digest);
});
```

## 📱 Frontend Integration

Update `src/pages/NewsHub.jsx` to use real API:

```javascript
const fetchNews = async (category) => {
  const response = await axios.get(
    `http://localhost:5000/api/news/category/${category}`
  );
  setArticles(response.data.articles);
};
```

## 🎯 Features Implemented

✅ NewsData.io API integration
✅ AI-powered news summarization (with fallback)
✅ Telegram bot with commands
✅ WhatsApp messaging via Twilio
✅ Category-based news filtering
✅ News search functionality
✅ Daily digest generation
✅ RESTful API endpoints

## 🔧 Troubleshooting

### Telegram Bot Not Responding
- Check if `TELEGRAM_BOT_TOKEN` is correct
- Ensure bot is started (look for "✅ Telegram Bot initialized" in logs)
- Try `/start` command first

### News API Errors
- Check if `NEWSDATA_API_KEY` is valid
- Free tier has 200 requests/day limit
- Check API status: https://newsdata.io/status

### WhatsApp Not Working
- Twilio requires phone number verification
- Use sandbox number for testing
- Check Twilio console for errors

## 📊 Next Steps

1. **User Preferences**: Store user news preferences in MongoDB
2. **Scheduled Digests**: Add cron jobs for automated delivery
3. **Push Notifications**: Integrate with Firebase for mobile push
4. **Analytics**: Track which news categories are most popular
5. **Personalization**: ML-based news recommendations

## 🌟 Pro Tips

- Cache news responses to reduce API calls
- Implement rate limiting on endpoints
- Add user authentication for personalized feeds
- Store user chat IDs in database for broadcast messages
- Use webhooks for real-time Telegram/WhatsApp updates
