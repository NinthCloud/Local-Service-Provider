import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Service = sequelize.define(
    "Service",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      providerId: {  // Changed from userId to providerId
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      desc: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      totalStars: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      starNumber: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      cat: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Categories',
          key: 'id'
        }
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      cover: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      shortTitle: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shortDesc: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      avgServiceTime: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      revisionNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      features: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      locationA: {
        type: DataTypes.ARRAY(DataTypes.STRING), // pincode
        allowNull: true,
        defaultValue: [],
      },
      locationB: {
        type: DataTypes.ARRAY(DataTypes.STRING), // city
        allowNull: true,
        defaultValue: [],
      },
      sales: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isUnlisted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      availability: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      search_vector: {
        type: DataTypes.TSVECTOR,
        allowNull: true,
      },
    },
    {
      timestamps: true,
    }
  );

  // Define associations
  Service.associate = (models) => {
    // Service belongs to a Provider
    Service.belongsTo(models.Provider, {
      foreignKey: "providerId",
      as: "provider",
    });

    // Service belongs to a Category
    Service.belongsTo(models.Category, {
      foreignKey: "categoryId",
      as: "category",
    });

    // Service has many Reviews
    Service.hasMany(models.Review, {
      foreignKey: "serviceId",
      as: "reviews",
    });

    // Service has many Orders
    Service.hasMany(models.Booking, {
      foreignKey: "serviceId",
      as: "bookings",
    });

    // // Service belongs to many Users in wishlist (many-to-many)
    // Service.belongsToMany(models.User, {
    //   through: models.Wishlist,
    //   foreignKey: "serviceId",
    //   as: "wishingUsers",
    // });
  };

  // Update hooks to work with providerId instead of userId
  Service.beforeCreate(async (service, options) => {
    if (service.categoryId && !service.cat) {
      const category = await sequelize.models.Category.findByPk(service.categoryId);
      if (category) {
        service.cat = category.name;
      }
    }
  });

  Service.beforeUpdate(async (service, options) => {
    if (service.changed('categoryId')) {
      const category = await sequelize.models.Category.findByPk(service.categoryId);
      if (category) {
        service.cat = category.name;
      }
    }
  });

  return Service;
};