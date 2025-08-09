import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import UserModel from './user.js';
import ReferralEventModel from './referralEvent.js';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || '';

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false,
    })
  : new Sequelize(
      process.env.POSTGRES_DB || 'referral_db',
      process.env.POSTGRES_USER || 'postgres',
      process.env.POSTGRES_PASSWORD || 'postgres',
      {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: Number(process.env.POSTGRES_PORT || 5432),
        dialect: 'postgres',
        logging: false,
      }
    );

const User = UserModel(sequelize);
const ReferralEvent = ReferralEventModel(sequelize);

// Associations
User.hasMany(User, { as: 'Referrals', foreignKey: 'referredById' });
User.belongsTo(User, { as: 'Referrer', foreignKey: 'referredById' });

User.hasMany(ReferralEvent, { foreignKey: 'userId' });
ReferralEvent.belongsTo(User, { foreignKey: 'userId' });

export { sequelize, Sequelize, User, ReferralEvent };


