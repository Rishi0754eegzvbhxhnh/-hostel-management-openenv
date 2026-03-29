const axios = require('axios');

const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY;
const BASE_URL = 'https://newsdata.io/api/1/news';

/**
 * Fetch news from NewsData.io API
 * @param {Object} options - Query parameters
 * @param {string} options.category - News category (technology, sports, health, etc.)
 * @param {string} options.country - Country code (in for India)
 * @param {string} options.language - Language code (en for English)
 * @param {number} options.size - Number of articles to fetch
 */
async function fetchNews(options = {}) {
  try {
    const {
      category = 'top',
      country = 'in',
      language = 'en',
      size = 10,
      q = null // search query
    } = options;

    const params = {
      apikey: NEWSDATA_API_KEY,
      country,
      language,
      size
    };

    if (category !== 'top') {
      params.category = category;
    }

    if (q) {
      params.q = q;
    }

    const response = await axios.get(BASE_URL, { params });

    if (response.data.status === 'success') {
      return {
        success: true,
        articles: response.data.results.map(article => ({
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.link,
          imageUrl: article.image_url,
          source: article.source_id,
          publishedAt: article.pubDate,
          category: article.category,
          country: article.country
        })),
        totalResults: response.data.totalResults
      };
    }

    return { success: false, error: 'Failed to fetch news' };
  } catch (error) {
    console.error('NewsData API Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Get news by category
 */
async function getNewsByCategory(category, limit = 10) {
  return await fetchNews({ category, size: limit });
}

/**
 * Search news by keyword
 */
async function searchNews(query, limit = 10) {
  return await fetchNews({ q: query, size: limit });
}

/**
 * Get trending news (top headlines)
 */
async function getTrendingNews(limit = 10) {
  return await fetchNews({ category: 'top', size: limit });
}

module.exports = {
  fetchNews,
  getNewsByCategory,
  searchNews,
  getTrendingNews
};
