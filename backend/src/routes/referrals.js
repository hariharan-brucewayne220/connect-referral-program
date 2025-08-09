import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { ReferralEvent, User } from '../models/index.js';

const router = express.Router();

// GET /api/referrals/me - get current user's referral data
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const clicks = await ReferralEvent.count({ where: { referralCode: user.referralCode, eventType: 'CLICK' } });
    // Derive signups from users table (more portable than JSONB matches)
    const signups = await User.count({ where: { referredById: user.id } });
    const credits = user.credits;
    res.json({ referralCode: user.referralCode, clicks, signups, credits });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /ref/:code - public referral redirect + click log
router.get('/r/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { source } = req.query;
    await ReferralEvent.create({ referralCode: code, eventType: 'CLICK', source: source || null });
    // In a real app redirect to marketing/signup page with code
    res.json({ ok: true, referralCode: code });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


