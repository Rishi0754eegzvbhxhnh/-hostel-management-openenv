/**
 * services/huggingFaceService.js
 * ==============================
 * Hugging Face Inference API integration.
 *
 * WHERE IT'S USED IN THIS PROJECT:
 * 1. Complaint auto-classification (urgency & category detection)
 * 2. Sentiment analysis on student feedback
 * 3. Smart parking ANPR text parsing
 *
 * HOW TO ADD YOUR HF TOKEN:
 * 1. Go to https://huggingface.co → Settings → Access Tokens → New token
 * 2. Add to backend/.env:  HF_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
 * 3. That's it! No model download, no GPU needed — uses HF Inference API.
 *
 * FREE TIER: 30,000 requests/month (sufficient for a hostel project).
 */
const axios = require('axios');

const HF_TOKEN = process.env.HF_API_TOKEN;
const HF_BASE  = 'https://api-inference.huggingface.co/models';

// ── Core request helper ────────────────────────────────────────────────────────
async function hfRequest(model, inputs, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await axios.post(
        `${HF_BASE}/${model}`,
        { inputs },
        {
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );
      return res.data;
    } catch (err) {
      // Model is loading (cold start) — wait and retry
      if (err.response?.status === 503 && attempt < retries) {
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }
      throw err;
    }
  }
}

// ── 1. Complaint Urgency Classification ───────────────────────────────────────
// Uses zero-shot classification to detect urgency level and category.
// Model: facebook/bart-large-mnli (best zero-shot, free)
async function classifyComplaint(text) {
  if (!HF_TOKEN) {
    return ruleBasedClassify(text); // graceful fallback
  }
  try {
    const urgencyLabels   = ['urgent', 'high priority', 'medium priority', 'low priority'];
    const categoryLabels  = ['maintenance', 'food', 'cleanliness', 'security', 'noise', 'other'];

    const [urgencyRes, categoryRes] = await Promise.all([
      hfRequest('facebook/bart-large-mnli', {
        text,
        candidate_labels: urgencyLabels.join(', '),
      }),
      hfRequest('facebook/bart-large-mnli', {
        text,
        candidate_labels: categoryLabels.join(', '),
      }),
    ]);

    const urgency  = urgencyRes.labels?.[0] || 'medium priority';
    const category = categoryRes.labels?.[0] || 'other';

    const priorityMap = {
      'urgent': 'urgent',
      'high priority': 'high',
      'medium priority': 'medium',
      'low priority': 'low',
    };

    return {
      success: true,
      priority: priorityMap[urgency] || 'medium',
      category,
      urgencyScore: urgencyRes.scores?.[0] || 0.5,
      categoryScore: categoryRes.scores?.[0] || 0.5,
      model: 'facebook/bart-large-mnli',
    };
  } catch (err) {
    console.error('[HF] classifyComplaint failed:', err.message);
    return ruleBasedClassify(text);
  }
}

// ── 2. Sentiment Analysis on Feedback ────────────────────────────────────────
// Model: distilbert-base-uncased-finetuned-sst-2-english (fast, accurate)
async function analyzeSentiment(text) {
  if (!HF_TOKEN) {
    return { success: false, sentiment: 'neutral', score: 0.5, fallback: true };
  }
  try {
    const result = await hfRequest(
      'distilbert-base-uncased-finetuned-sst-2-english',
      text
    );
    const top = Array.isArray(result[0]) ? result[0][0] : result[0];
    return {
      success: true,
      sentiment: top.label.toLowerCase(), // 'positive' or 'negative'
      score: parseFloat(top.score.toFixed(3)),
      model: 'distilbert-base-uncased-finetuned-sst-2-english',
    };
  } catch (err) {
    console.error('[HF] analyzeSentiment failed:', err.message);
    return { success: false, sentiment: 'neutral', score: 0.5, fallback: true };
  }
}

// ── 3. Vehicle Number Parsing (for Smart Parking) ────────────────────────────
// Uses a simple regex pattern since OCR models are large.
// If HF token is available, uses token-classification for NER on plate text.
function parseVehicleNumber(rawText) {
  // Standard Indian vehicle number pattern: XX-00-XX-0000
  const match = rawText?.toUpperCase().match(/[A-Z]{2}[\s-]?\d{2}[\s-]?[A-Z]{1,2}[\s-]?\d{4}/);
  if (match) {
    return {
      success: true,
      vehicleNo: match[0].replace(/\s/g, '-').toUpperCase(),
    };
  }
  return { success: false, vehicleNo: rawText?.toUpperCase() || 'UNKNOWN' };
}

// ── 4. Summarize long complaint text ─────────────────────────────────────────
// Model: facebook/bart-large-cnn (summarization)
async function summarizeText(text, maxLen = 50) {
  if (!HF_TOKEN || text.length < 100) return { success: false, summary: text };
  try {
    const result = await hfRequest('facebook/bart-large-cnn', text);
    return {
      success: true,
      summary: result[0]?.summary_text || text,
      model: 'facebook/bart-large-cnn',
    };
  } catch (err) {
    return { success: false, summary: text.substring(0, maxLen) + '...' };
  }
}

// ── Rule-based fallback (no API key needed) ───────────────────────────────────
function ruleBasedClassify(text) {
  const lower = text.toLowerCase();
  const urgentWords  = ['fire', 'flood', 'gas leak', 'broken', 'emergency', 'urgent', 'danger', 'blood', 'accident'];
  const highWords    = ['not working', 'power cut', 'no water', 'theft', 'fight', 'pain'];
  const foodWords    = ['food', 'mess', 'meal', 'cook', 'taste', 'hungry'];
  const cleanWords   = ['dirty', 'clean', 'cockroach', 'pest', 'smell', 'garbage'];
  const secWords     = ['security', 'gate', 'stranger', 'theft', 'cctv', 'lock'];
  const noiseWords   = ['noise', 'loud', 'music', 'disturb', 'night'];
  const maintWords   = ['fan', 'light', 'tap', 'pipe', 'geyser', 'ac', 'repair', 'broken', 'leak'];

  let priority = 'medium';
  let category = 'other';

  if (urgentWords.some(w => lower.includes(w))) priority = 'urgent';
  else if (highWords.some(w => lower.includes(w))) priority = 'high';
  else if (lower.length < 30) priority = 'low';

  if (foodWords.some(w => lower.includes(w))) category = 'food';
  else if (cleanWords.some(w => lower.includes(w))) category = 'cleanliness';
  else if (secWords.some(w => lower.includes(w))) category = 'security';
  else if (noiseWords.some(w => lower.includes(w))) category = 'noise';
  else if (maintWords.some(w => lower.includes(w))) category = 'maintenance';

  return { success: true, priority, category, fallback: true, model: 'rule-based' };
}

module.exports = {
  classifyComplaint,
  analyzeSentiment,
  parseVehicleNumber,
  summarizeText,
  ruleBasedClassify,
};
