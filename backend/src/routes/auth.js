import express from 'express';
import bcrypt from 'bcryptjs';
import { User, ReferralEvent } from '../models/index.js';
import { signToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, referralCode, source } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);

    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ where: { referralCode } });
    }

    const user = await User.create({
      email,
      passwordHash,
      name,
      referredById: referrer ? referrer.id : null,
    });

    // Log SIGNUP event
    await ReferralEvent.create({
      userId: user.id,
      referralCode: referralCode || user.referralCode,
      eventType: 'SIGNUP',
      source: source || null,
      metadata: referrer ? { referrerId: referrer.id } : null,
    });

    // For demo: consider signup as verified conversion right away
    await ReferralEvent.create({
      userId: user.id,
      referralCode: referralCode || user.referralCode,
      eventType: 'CONVERSION',
      source: source || null,
    });

    // Reward logic: every N referred signups grants credits
    if (referrer) {
      const N = Number(process.env.REFERRAL_CONVERSION_THRESHOLD || 3);
      const creditsPerThreshold = Number(process.env.CREDITS_PER_THRESHOLD || 10);
      const referredUsers = await User.count({ where: { referredById: referrer.id } });
      if (referredUsers && referredUsers % N === 0) {
        referrer.credits += creditsPerThreshold;
        await referrer.save();
      }
    }

    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, referralCode: user.referralCode, credits: user.credits } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await user.checkPassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, referralCode: user.referralCode, credits: user.credits } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


