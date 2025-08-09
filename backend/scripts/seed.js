import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { sequelize, User, ReferralEvent } from '../src/models/index.js';

dotenv.config();

async function seed() {
  await sequelize.sync({ force: true });

  const passwordHash = await bcrypt.hash('password123', 10);

  const alice = await User.create({ email: 'alice@example.com', passwordHash, name: 'Alice' });
  const bob = await User.create({ email: 'bob@example.com', passwordHash, name: 'Bob', referredById: alice.id });
  const carol = await User.create({ email: 'carol@example.com', passwordHash, name: 'Carol', referredById: alice.id });

  await ReferralEvent.bulkCreate([
    { referralCode: alice.referralCode, eventType: 'CLICK', source: 'header' },
    { referralCode: alice.referralCode, eventType: 'CLICK', source: 'footer' },
    { referralCode: alice.referralCode, userId: bob.id, eventType: 'SIGNUP', source: 'header', metadata: { referrerId: alice.id } },
    { referralCode: alice.referralCode, userId: bob.id, eventType: 'CONVERSION', source: 'header', metadata: { referrerId: alice.id } },
    { referralCode: alice.referralCode, userId: carol.id, eventType: 'SIGNUP', source: 'sidebar', metadata: { referrerId: alice.id } },
    { referralCode: alice.referralCode, userId: carol.id, eventType: 'CONVERSION', source: 'sidebar', metadata: { referrerId: alice.id } },
  ]);

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});


