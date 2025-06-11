// import { DataTypes } from 'sequelize';

// export default (sequelize) => {
//   const User = sequelize.define('User', {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     username: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true
//     },
//     fullName: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//       validate: {
//         isEmail: true
//       }
//     },
//     password: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     image: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     city: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     address: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     pincode: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     phone: {
//       type: DataTypes.BIGINT,
//       allowNull: false
//     },
//     desc2: {
//       type: DataTypes.TEXT,
//       allowNull: true
//     },
//     isSeller: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false
//     },
//     appliedForProvider: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false
//     },
//     approvedByAdmin: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false
//     },
//     role: {
//       type: DataTypes.ENUM('user', 'admin'),
//       defaultValue: 'user'
//     },
//     securityQA: {
//       type: DataTypes.JSONB, // Using JSONB for PostgreSQL
//       allowNull: true,
//       comment: "Security questions and answers for account recovery"
//     }
//   }, {
//     timestamps: true
//   });
  
//   // Define associations
//   User.associate = (models) => {
//     // User has one Provider
//     User.hasOne(models.Provider, {
//       foreignKey: 'userId',
//       as: 'provider'
//     });
    
//     // User has many Bookings (as a buyer)
//     User.hasMany(models.Booking, {
//       foreignKey: 'buyerId',
//       as: 'buyerBookings'
//     });
    
//     // // User has many Bookings (as a seller)
//     // User.hasMany(models.Booking, {
//     //   foreignKey: 'sellerId',
//     //   as: 'sellerBookings'
//     // });
    
//     // User has many Reviews (that they wrote)
//     User.hasMany(models.Review, {
//       foreignKey: 'userId',
//       as: 'reviews'
//     });
    
//     // User has many Services in wishlist (many-to-many)
//     User.belongsToMany(models.Service, {
//       through: models.Wishlist,
//       foreignKey: 'userId',
//       as: 'wishedServices'
//     });
//   };
  
//   return User;
// };


import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pincode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    phone: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    desc2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isSeller: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    appliedForProvider: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    approvedByAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user'
    },
    securityQA: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Security questions and answers for account recovery"
    },
    // NEW: Wishlist services stored as array of service IDs
    wishlistServices: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
      defaultValue: [],
      comment: "Array of service IDs that user has wishlisted"
    }
  }, {
    timestamps: true
  });

  // Define associations
  User.associate = (models) => {
    // User has one Provider
    User.hasOne(models.Provider, {
      foreignKey: 'userId',
      as: 'provider'
    });
    
    // User has many Bookings (as a buyer)
    User.hasMany(models.Booking, {
      foreignKey: 'buyerId',
      as: 'buyerBookings'
    });
    
    // User has many Reviews (that they wrote)
    User.hasMany(models.Review, {
      foreignKey: 'userId',
      as: 'reviews'
    });

    // NOTE: Removed the many-to-many wishlist association since we're now using an array
    // User.belongsToMany(models.Service, {
    //   through: models.Wishlist,
    //   foreignKey: 'userId',
    //   as: 'wishedServices'
    // });
  };

  // Instance methods for wishlist management
  User.prototype.addToWishlist = async function(serviceId) {
    if (!this.wishlistServices.includes(serviceId)) {
      this.wishlistServices.push(serviceId);
      await this.save();
    }
    return this;
  };

  User.prototype.removeFromWishlist = async function(serviceId) {
    this.wishlistServices = this.wishlistServices.filter(id => id !== serviceId);
    await this.save();
    return this;
  };

  User.prototype.isInWishlist = function(serviceId) {
    return this.wishlistServices.includes(serviceId);
  };

  User.prototype.clearWishlist = async function() {
    this.wishlistServices = [];
    await this.save();
    return this;
  };

  return User;
};