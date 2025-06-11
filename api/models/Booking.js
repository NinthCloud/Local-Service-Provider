import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    preferredDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    preferredTime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    providerId: {  // Added providerId to replace sellerId
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // sellerId: {  // Keeping this for backward compatibility but can be removed later
    //   type: DataTypes.INTEGER,
    //   allowNull: true
    // },
    buyerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Confirmed', 'Canceled', 'Expired'),
      defaultValue: 'Pending'
    }
    // For future updates
    // payment_intent: {
    //   type: DataTypes.STRING,
    //   allowNull: true
    // },
    // isCompleted: {
    //   type: DataTypes.BOOLEAN,
    //   defaultValue: false
    // }
  }, {
    timestamps: true
  });

  // Define associations
  Booking.associate = (models) => {
    // Booking belongs to a Service
    Booking.belongsTo(models.Service, {
      foreignKey: 'serviceId',
      as: 'service'
    });
    
    // Booking belongs to a User (buyer)
    Booking.belongsTo(models.User, {
      foreignKey: 'buyerId',
      as: 'buyer'
    });
    
    // Booking belongs to a Provider
    Booking.belongsTo(models.Provider, {
      foreignKey: 'providerId',
      as: 'provider'
    });
    
    // // Booking belongs to a User (seller) - keep for backward compatibility
    // Booking.belongsTo(models.User, {
    //   foreignKey: 'sellerId',
    //   as: 'seller'
    // });
  };

  // // Hook to ensure consistency between providerId and sellerId during creation
  // Booking.beforeCreate(async (booking, options) => {
  //   if (booking.providerId && !booking.sellerId) {
  //     try {
  //       const provider = await sequelize.models.Provider.findByPk(booking.providerId, {
  //         include: [{ model: sequelize.models.User, as: 'user' }]
  //       });
  //       if (provider && provider.user) {
  //         booking.sellerId = provider.user.id;
  //       }
  //     } catch (error) {
  //       console.error('Error in Booking beforeCreate hook:', error);
  //     }
  //   }
  // });

  return Booking;
};