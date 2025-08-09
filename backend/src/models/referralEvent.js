import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ReferralEvent = sequelize.define(
    'ReferralEvent',
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true, // may be null for click before signup
      },
      referralCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      eventType: {
        type: DataTypes.ENUM('CLICK', 'SIGNUP', 'CONVERSION'),
        allowNull: false,
      },
      source: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      occurredAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'referral_events',
      indexes: [
        { fields: ['referralCode'] },
        { fields: ['userId'] },
        { fields: ['eventType'] },
        { fields: ['occurredAt'] },
      ],
    }
  );

  return ReferralEvent;
};


