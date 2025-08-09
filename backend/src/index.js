import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { sequelize, ReferralEvent, User } from './models/index.js';
import authRoutes from './routes/auth.js';
import referralRoutes from './routes/referrals.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();

const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/analytics', analyticsRoutes);

// Public referral redirect: /ref/:code -> logs click and redirects to frontend signup
app.get('/ref/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { source } = req.query;
    // Try to enrich event with referrerId if code matches a user
    let metadata = null;
    const referrer = await User.findOne({ where: { referralCode: code } });
    if (referrer) metadata = { referrerId: referrer.id };
    await ReferralEvent.create({ referralCode: code, eventType: 'CLICK', source: source || null, metadata });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/signup?ref=${encodeURIComponent(code)}`);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();


