import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    star: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    desc: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    timestamps: true
  });

  // Define associations
  Review.associate = (models) => {
    // Review belongs to a Service
    Review.belongsTo(models.Service, {
      foreignKey: 'serviceId',
      as: 'service'
    });

    // Review belongs to a User
    Review.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // Review belongs to a Booking
    Review.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking'
    });
  };

  return Review;
};