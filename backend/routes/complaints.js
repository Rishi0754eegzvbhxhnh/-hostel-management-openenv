const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

const imageService = require('../services/imageService');
const hf           = require('../services/huggingFaceService');

// POST /api/complaints — student submits complaint with optional base64 images
router.post('/', auth, async (req, res) => {
  try {
    const { category, title, description, roomNumber, priority, images } = req.body;
    
    let aiStatus = 'uncertain';
    let aiConfidence = 0;

    // Analyze first image for authenticity if available
    if (images && images.length > 0) {
      try {
        const result = await imageService.detectAiImage(images[0]);
        if (result.success) {
          aiStatus = result.isAI ? 'ai_detected' : 'authentic';
          aiConfidence = result.confidence;
        }
      } catch (imageError) {
        console.log('Image analysis skipped:', imageError.message);
      }
    }

    // ── Hugging Face AI: auto-classify complaint priority & category ──────
    let hfResult = { priority: priority || 'medium', category: category || 'other', model: 'rule-based' };
    try {
      const textToClassify = `${title || ''} ${description || ''}`.trim();
      if (textToClassify.length > 5) {
        const classified  = await hf.classifyComplaint(textToClassify);
        hfResult.priority = classified.priority || hfResult.priority;
        hfResult.category = classified.category || hfResult.category;
        hfResult.model    = classified.model || 'rule-based';
        console.log(`🤗 HF classified: priority=${hfResult.priority}, category=${hfResult.category} [${hfResult.model}]`);
      }
    } catch (hfErr) {
      console.warn('HF classification skipped:', hfErr.message);
    }

    const complaint = new Complaint({
      student: req.user.id,
      studentName: req.body.studentName || 'Unknown Student',
      studentEmail: req.body.studentEmail || '',
      roomNumber,
      category:    hfResult.category,            // AI-detected category
      title,
      description,
      priority:    priority || hfResult.priority, // AI-detected priority (user can override)
      images: images || [],
      aiStatus,
      aiConfidence,
      hfPriority:  hfResult.priority,
      hfCategory:  hfResult.category,
      hfModel:     hfResult.model,
    });
    
    await complaint.save();
    console.log('✅ Complaint saved:', complaint._id);
    
    res.status(201).json({ 
      success: true,
      message: 'Complaint submitted successfully', 
      complaint,
      aiClassification: {
        priority: hfResult.priority,
        category: hfResult.category,
        model: hfResult.model,
      },
    });
  } catch (err) {
    console.error('❌ Complaint submission error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
});

// GET /api/complaints/my — student's own complaints
router.get('/my', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/complaints — admin sees all
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/complaints/:id — admin updates status
router.patch('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { status, adminResponse, priority } = req.body;
    const update = { status, adminResponse, priority };
    if (status === 'resolved') update.resolvedAt = new Date();
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
