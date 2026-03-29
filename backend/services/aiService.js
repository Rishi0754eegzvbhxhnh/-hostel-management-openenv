const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Summarize news articles using OpenAI
 * @param {Array} articles - Array of news articles
 * @param {string} format - Summary format ('bullet' or 'paragraph')
 */
async function summarizeNews(articles, format = 'bullet') {
  try {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
      // Fallback: Simple text summarization without AI
      return generateSimpleSummary(articles, format);
    }

    const newsText = articles
      .slice(0, 5) // Limit to top 5 articles
      .map((a, i) => `${i + 1}. ${a.title}\n   ${a.description || 'No description'}`)
      .join('\n\n');

    const prompt = format === 'bullet'
      ? `Summarize these news headlines in 5 concise bullet points:\n\n${newsText}`
      : `Provide a brief paragraph summarizing these news headlines:\n\n${newsText}`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful news summarization assistant. Provide clear, concise summaries.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      summary: response.data.choices[0].message.content,
      articlesCount: articles.length
    };
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    // Fallback to simple summary
    return generateSimpleSummary(articles, format);
  }
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
  generateSimpleSummary
};
