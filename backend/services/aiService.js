const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const XAI_API_KEY = process.env.XAI_API_KEY;
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Summarize news articles using Gemini AI
 */
async function summarizeNews(articles, format = 'bullet') {
  try {
    if (!GEMINI_API_KEY) {
      return generateSimpleSummary(articles, format);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const newsText = articles
      .slice(0, 5)
      .map((a, i) => `${i + 1}. ${a.title}\n   ${a.description || 'No description'}`)
      .join('\n\n');

    const prompt = format === 'bullet'
      ? `Summarize these news headlines in 5 concise bullet points:\n\n${newsText}`
      : `Provide a brief paragraph summarizing these news headlines:\n\n${newsText}`;

    const result = await model.generateContent(`System: You are a helpful news summarization assistant.\n\nUser: ${prompt}`);
    const response = await result.response;
    
    return {
      success: true,
      summary: response.text(),
      articlesCount: articles.length
    };
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    return generateSimpleSummary(articles, format);
  }
}

/**
 * AI Provider Switchboard with Fallback
 */
async function generateChatResponse(query, context = {}, systemPrompt = '') {
  // Try xAI first if configured
  if (AI_PROVIDER === 'xai' && XAI_API_KEY) {
    try {
      return await generateXAIResponse(query, context, systemPrompt);
    } catch (error) {
      console.error('xAI failed, falling back to Gemini:', error.message);
      // Fall through to Gemini
    }
  }
  
  // Try Gemini if configured
  if (GEMINI_API_KEY) {
    try {
      return await generateGeminiResponse(query, context, systemPrompt);
    } catch (error) {
      console.error('Gemini failed, using rule-based fallback:', error.message);
      // Fall through to rule-based
    }
  }
  
  // Rule-based fallback
  return generateRuleBasedResponse(query, context);
}

/**
 * xAI (Grok) Implementation via Axios
 */
async function generateXAIResponse(query, context, systemPrompt) {
  if (!XAI_API_KEY) throw new Error('xAI API Key missing');

  const fullPrompt = `${systemPrompt}\n\nCONTEXT DATA:\n${JSON.stringify(context, null, 2)}`;
  
  const response = await axios.post('https://api.x.ai/v1/chat/completions', {
    model: "grok-beta",
    messages: [
      { role: "system", content: fullPrompt },
      { role: "user", content: query }
    ],
    temperature: 0.7
  }, {
    headers: {
      'Authorization': `Bearer ${XAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  return {
    success: true,
    answer: response.data.choices[0].message.content
  };
}

/**
 * Gemini Implementation
 */
async function generateGeminiResponse(query, context, systemPrompt) {
  if (!GEMINI_API_KEY) throw new Error('Gemini API Key missing');

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const fullPrompt = `System: ${systemPrompt}\n\nCONTEXT DATA:\n${JSON.stringify(context, null, 2)}\n\nUSER QUERY: "${query}"`;
  
  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  return {
    success: true,
    answer: response.text()
  };
}

/**
 * Generate simple summary without AI (fallback)
 */
function generateSimpleSummary(articles, format) {
  const topArticles = articles.slice(0, 5);
  
  if (format === 'bullet') {
    const summary = topArticles
      .map((a, i) => `• ${a.title}`)
      .join('\n');
    
    return {
      success: true,
      summary: `📰 Top ${topArticles.length} Headlines:\n\n${summary}`,
      articlesCount: articles.length,
      fallback: true
    };
  } else {
    const titles = topArticles.map(a => a.title).join('. ');
    return {
      success: true,
      summary: `Today's top stories include: ${titles}`,
      articlesCount: articles.length,
      fallback: true
    };
  }
}

/**
 * Rule-based response generator (fallback when AI APIs fail)
 */
function generateRuleBasedResponse(query, context) {
  const lowerQuery = query.toLowerCase();
  
  // Room queries
  if (lowerQuery.includes('room') || lowerQuery.includes('available')) {
    return {
      success: true,
      answer: `We currently have ${context.rooms?.available || 0} rooms available out of ${context.rooms?.total || 0} total rooms. Prices range from ${context.rooms?.priceRange || '₹4500-₹12000'}. Would you like to book one?`
    };
  }
  
  // Food/Menu queries
  if (lowerQuery.includes('food') || lowerQuery.includes('menu') || lowerQuery.includes('meal') || lowerQuery.includes('eat')) {
    const menu = context.food?.menu;
    if (menu) {
      return {
        success: true,
        answer: `Today's menu (${context.food.today}):\n🍳 Breakfast: ${menu.breakfast}\n🍛 Lunch: ${menu.lunch}\n🍽️ Dinner: ${menu.dinner}`
      };
    }
    return {
      success: true,
      answer: "Our mess serves fresh, nutritious meals three times a day. Check the dashboard for today's menu!"
    };
  }
  
  // Laundry queries
  if (lowerQuery.includes('laundry') || lowerQuery.includes('wash') || lowerQuery.includes('clothes')) {
    return {
      success: true,
      answer: `We have ${context.laundry?.available || 0} washing machines available right now out of ${context.laundry?.total || 0} total. You can book one through the Smart Living section!`
    };
  }
  
  // Complaint queries
  if (lowerQuery.includes('complaint') || lowerQuery.includes('issue') || lowerQuery.includes('problem')) {
    return {
      success: true,
      answer: `There are currently ${context.stats?.pendingComplaints || 0} pending complaints. You can file a new complaint through the Complaints section, and our team will address it within 24 hours.`
    };
  }
  
  // Energy/Electricity queries
  if (lowerQuery.includes('energy') || lowerQuery.includes('electricity') || lowerQuery.includes('power')) {
    return {
      success: true,
      answer: `Current hostel energy consumption is ${context.infrastructure?.energy || 0} kWh. We're committed to sustainable living—check out the gamification section to earn eco-points!`
    };
  }
  
  // Events queries
  if (lowerQuery.includes('event') || lowerQuery.includes('activity') || lowerQuery.includes('happening')) {
    return {
      success: true,
      answer: "Check out the Events Calendar for upcoming activities! We regularly host coding hackathons, cultural nights, and wellness sessions."
    };
  }
  
  // Payment/Fee queries
  if (lowerQuery.includes('payment') || lowerQuery.includes('fee') || lowerQuery.includes('pay')) {
    return {
      success: true,
      answer: "You can view and pay your hostel fees through the Payment section. We accept UPI, cards, and net banking. Need help with a payment issue?"
    };
  }
  
  // Who are you queries
  if (lowerQuery.includes('who are you') || lowerQuery.includes('what are you') || lowerQuery.includes('your name')) {
    return {
      success: true,
      answer: "I'm Aria, your intelligent hostel AI assistant! I can help you with room bookings, food menus, laundry status, complaints, events, and more. Just ask me anything!"
    };
  }
  
  // Help queries
  if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
    return {
      success: true,
      answer: "I can help you with:\n• Room availability and booking\n• Today's food menu\n• Laundry machine status\n• Filing complaints\n• Event information\n• Payment queries\n• Energy usage stats\n\nJust ask me anything about hostel life!"
    };
  }
  
  // Default response
  return {
    success: true,
    answer: "I'm here to help! You can ask me about room availability, food menu, laundry status, complaints, events, or payments. What would you like to know?"
  };
}

/**
 * Generate personalized news digest
 */
async function generateDigest(articles, userName = 'Student') {
  const summary = await summarizeNews(articles, 'bullet');
  
  const digest = `🌅 Good Morning, ${userName}!\n\n` +
    `Here's your personalized news digest:\n\n` +
    `${summary.summary}\n\n` +
    `📊 Total articles: ${summary.articlesCount}\n` +
    `🕐 Generated: ${new Date().toLocaleTimeString('en-IN')}`;
  
  return {
    success: true,
    digest,
    summary: summary.summary,
    articlesCount: summary.articlesCount
  };
}

module.exports = {
  summarizeNews,
  generateDigest,
  generateSimpleSummary,
  generateChatResponse,
  generateRuleBasedResponse
};
