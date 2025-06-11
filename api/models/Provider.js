import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Provider = sequelize.define('Provider', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    verify: {
      type: DataTypes.STRING,
      allowNull: true
    },
    desc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    serviceLevel: {
      type: DataTypes.STRING,
      allowNull: true
    },
    experience: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profession: {
      type: DataTypes.STRING,
      allowNull: true
    },
    serviceHours: {
      type: DataTypes.STRING,
      allowNull: true
    },
    providerName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    providerEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    providerAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    providerPhone: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true
  });
  
  // Define associations
  Provider.associate = (models) => {
    // Provider belongs to a User
    Provider.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    // Provider has many Services
    Provider.hasMany(models.Service, {
      foreignKey: 'providerId',
      as: 'services'
    });
  };
  
  return Provider;
};