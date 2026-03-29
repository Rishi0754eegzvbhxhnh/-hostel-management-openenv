const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');
const aiService = require('../services/aiService');

// Get news by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await newsService.getNewsByCategory(category, limit);
    
    if (result.success) {
      res.json({
        success: true,
        category,
        articles: result.articles,
        total: result.totalResults
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get trending/top news
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await newsService.getTrendingNews(limit);
    
    if (result.success) {
      res.json({
        success: true,
        articles: result.articles,
        total: result.totalResults
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Search news
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const result = await newsService.searchNews(q, limit);
    
    if (result.success) {
      res.json({
        success: true,
        query: q,
        articles: result.articles,
        total: result.totalResults
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get AI-summarized news
router.get('/summary/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const format = req.query.format || 'bullet';
    
    // Fetch news
    const newsResult = await newsService.getNewsByCategory(category, 10);
    
    if (!newsResult.success) {
      return res.status(500).json({
        success: false,
        message: newsResult.error
      });
    }
    
    // Generate AI summary
    const summaryResult = await aiService.summarizeNews(newsResult.articles, format);
    
    res.json({
      success: true,
      category,
      summary: summaryResult.summary,
      articlesCount: summaryResult.articlesCount,
      articles: newsResult.articles.slice(0, 5) // Include top 5 articles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Generate daily digest
router.get('/digest', async (req, res) => {
  try {
    const userName = req.query.name || 'Student';
    const category = req.query.category || 'top';
    
    // Fetch news
    const newsResult = category === 'top'
      ? await newsService.getTrendingNews(10)
      : await newsService.getNewsByCategory(category, 10);
    
    if (!newsResult.success) {
      return res.status(500).json({
        success: false,
        message: newsResult.error
      });
    }
    
    // Generate digest
    const digestResult = await aiService.generateDigest(newsResult.articles, userName);
    
    res.json({
      success: true,
      digest: digestResult.digest,
      articles: newsResult.articles.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
