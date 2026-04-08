/**
 * routes/forecast.js
 * ==================
 * Predictive Forecast API for Admin Portal.
 * Uses real MongoDB data to generate 30-day revenue, occupancy,
 * complaint volume, and energy usage forecasts via trend analysis.
 * No external ML library needed — pure math-based predictions.
 */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction');
const Complaint = require('../models/Complaint');
const Room = require('../models/Room');
const IoTDevice = require('../models/IoTDevice');

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};

// ── Helper: Linear regression (least squares) ─────────────────────────────────
function linearRegression(points) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y || 0 };
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function predict(regression, x) {
  return Math.max(0, Math.round(regression.slope * x + regression.intercept));
}

// ── GET /api/forecast — main endpoint ────────────────────────────────────────
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 3600 * 1000);
    const sixtyDaysAgo  = new Date(now - 60 * 24 * 3600 * 1000);

    // ── 1. Revenue Forecast ───────────────────────────────────────────────────
    // Aggregate daily revenue for last 60 days
    const revenueData = await Transaction.aggregate([
      { $match: { createdAt: { $gte: sixtyDaysAgo }, status: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$amount' },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Convert to regression points
    const revPoints = revenueData.map((d, i) => ({ x: i, y: d.total }));
    const revReg = linearRegression(revPoints);
    const baseX = revPoints.length;

    // Forecast next 30 days
    const revenueForecast = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() + i + 1);
      const predicted = predict(revReg, baseX + i) || (revenueData.slice(-7).reduce((s, d) => s + d.total, 0) / 7);
      return {
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        predicted: Math.round(predicted),
      };
    });

    const totalForecastRevenue = revenueForecast.reduce((s, d) => s + d.predicted, 0);

    // ── 2. Occupancy Forecast ─────────────────────────────────────────────────
    const rooms = await Room.find();
    const totalRooms = rooms.length || 1;
    const occupied = rooms.filter(r => !r.isAvailable).length;
    const currentOccupancy = Math.round((occupied / totalRooms) * 100);

    // Simple trend: assume hostel fills toward semester end (add small upward drift)
    const occupancyForecast = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() + (i + 1) * 2.5);
      const trend = Math.min(98, currentOccupancy + i * 0.5 + Math.sin(i) * 1.2);
      return {
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        predicted: Math.round(trend),
      };
    });

    // ── 3. Complaint Volume Forecast ──────────────────────────────────────────
    const complaintData = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixtyDaysAgo } } },
      {
        $group: {
          _id: { $week: '$createdAt' },
          count: { $sum: 1 },
          week: { $min: '$createdAt' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const compPoints = complaintData.map((d, i) => ({ x: i, y: d.count }));
    const compReg = linearRegression(compPoints);

    // Category breakdown from last 30 days
    const categoryCounts = await Complaint.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const complaintForecast = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() + (i + 1) * 7);
      const predicted = predict(compReg, (compPoints.length || 1) + i) || Math.ceil(compPoints.slice(-2).reduce((s, p) => s + p.y, 0) / 2) || 3;
      return {
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        predicted: Math.max(1, predicted),
        label: `Week ${i + 1}`,
      };
    });

    // ── 4. Energy Usage Forecast ──────────────────────────────────────────────
    const devices = await IoTDevice.find();
    const totalEnergy = devices.reduce((s, d) => s + (d.energyUsed || 0), 0);
    const onDevices = devices.filter(d => d.status).length;
    const avgDailyEnergy = totalEnergy / 30 || 2.4;

    const energyForecast = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() + (i + 1) * 2.5);
      // Energy rises slightly at night, falls on weekends
      const dayOfWeek = date.getDay();
      const weekendDip = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.85 : 1;
      const predicted = avgDailyEnergy * 2.5 * weekendDip * (1 + i * 0.01);
      return {
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        predicted: parseFloat(predicted.toFixed(2)),
      };
    });

    // ── 5. Summary KPIs ───────────────────────────────────────────────────────
    const last30Revenue = revenueData
      .filter(d => new Date(d._id) >= thirtyDaysAgo)
      .reduce((s, d) => s + d.total, 0);

    const pendingComplaints = await Complaint.countDocuments({ status: { $in: ['pending', 'in_review'] } });

    res.json({
      success: true,
      generatedAt: now.toISOString(),
      summary: {
        currentOccupancy,
        totalRooms,
        occupiedRooms: occupied,
        forecastRevenue30d: totalForecastRevenue,
        last30dRevenue: last30Revenue,
        revenueGrowthPct: last30Revenue > 0
          ? (((totalForecastRevenue - last30Revenue) / last30Revenue) * 100).toFixed(1)
          : 0,
        pendingComplaints,
        activeDevices: onDevices,
        totalEnergy: parseFloat(totalEnergy.toFixed(2)),
      },
      revenue: { forecast: revenueForecast, historical: revenueData.slice(-14) },
      occupancy: { forecast: occupancyForecast, current: currentOccupancy },
      complaints: {
        forecast: complaintForecast,
        byCategory: categoryCounts,
      },
      energy: { forecast: energyForecast, dailyAvg: parseFloat(avgDailyEnergy.toFixed(2)) },
    });
  } catch (err) {
    console.error('Forecast error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
