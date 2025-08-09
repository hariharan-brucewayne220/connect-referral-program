import express from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { ReferralEvent, User, sequelize } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/analytics/summary - CTR, K-factor
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const clicks = await ReferralEvent.count({ where: { referralCode: user.referralCode, eventType: 'CLICK' } });
    const signups = await User.count({ where: { referredById: user.id } });

    const ctr = clicks ? Number((signups / clicks).toFixed(4)) : 0;
    // K-factor (simplified): avg referrals per user times conversion rate
    const totalUsers = await User.count();
    const totalReferred = await User.count({ where: { referredById: { [Op.not]: null } } });
    const avgReferralsPerUser = totalUsers ? totalReferred / totalUsers : 0;
    const conversions = await ReferralEvent.count({ where: { eventType: 'CONVERSION' } });
    const totalClicks = await ReferralEvent.count({ where: { eventType: 'CLICK' } });
    const conversionRate = totalClicks ? conversions / totalClicks : 0;
    const kFactor = Number((avgReferralsPerUser * conversionRate).toFixed(4));

    res.json({ ctr, kFactor, clicks, signups });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/timeseries - simple per-day counts
router.get('/timeseries', requireAuth, async (req, res) => {
  try {
    const { days = 14 } = req.query;
    const n = Math.max(1, Math.min(parseInt(days, 10) || 14, 90));
    const results = await ReferralEvent.findAll({
      attributes: [
        [sequelize.literal("DATE(\"occurredAt\")"), 'date'],
        'eventType',
        [fn('COUNT', col('id')), 'count'],
      ],
      group: [sequelize.literal("DATE(\"occurredAt\")"), 'eventType'],
      order: [[sequelize.literal('date'), 'ASC']],
      where: { occurredAt: { [Op.gte]: sequelize.literal(`NOW() - INTERVAL '${n} days'`) } },
    });
    res.json(results);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/best-cta - dummy best placement by CTR
router.get('/best-cta', requireAuth, async (req, res) => {
  try {
    // Dummy logic: pick among ['header','sidebar','footer'] using synthetic CTR
    const placements = ['header', 'sidebar', 'footer'];
    const synthetic = placements.map((p) => ({ placement: p, ctr: Math.random() * (p === 'header' ? 0.15 : p === 'sidebar' ? 0.12 : 0.1) }));
    synthetic.sort((a, b) => b.ctr - a.ctr);
    res.json({ bestPlacement: synthetic[0].placement, candidates: synthetic });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


