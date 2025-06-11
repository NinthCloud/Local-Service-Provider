// // db/index.js
// import sequelize from "../config/database.js";
// import UserModel from '../models/User.js';
// import ProviderModel from '../models/Provider.js';
// import ServiceModel from '../models/Service.js';
// import BookingModel from '../models/Booking.js';
// import ReviewModel from '../models/Review.js';
// import WishlistModel from '../models/Wishlist.js';
// import CategoryModel from '../models/Category.js';

// // Initialize models
// const User = UserModel(sequelize);
// const Provider = ProviderModel(sequelize);
// const Service = ServiceModel(sequelize);
// const Booking = BookingModel(sequelize);
// const Review = ReviewModel(sequelize);
// const Wishlist = WishlistModel(sequelize);
// const Category = CategoryModel(sequelize);

// // Define associations
// // User - Provider association (One-to-One)
// User.hasOne(Provider, { foreignKey: 'userId', as: 'provider' });
// Provider.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// // Provider - Service association (One-to-Many)
// Provider.hasMany(Service, { foreignKey: 'providerId', as: 'services' });
// Service.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });

// // Category - Service association (One-to-Many)
// Category.hasMany(Service, { foreignKey: 'categoryId', as: 'services' });
// Service.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// // Wishlist (Many-to-Many)
// User.belongsToMany(Service, { 
//   through: Wishlist, 
//   foreignKey: 'userId',
//   otherKey: 'serviceId',
//   as: 'wishedServices' 
// });

// Service.belongsToMany(User, { 
//   through: Wishlist, 
//   foreignKey: 'serviceId',
//   otherKey: 'userId',
//   as: 'wishingUsers' 
// });

// // Booking associations - Updated to include Provider
// User.hasMany(Booking, { foreignKey: 'buyerId', as: 'buyerBookings' });
// // User.hasMany(Booking, { foreignKey: 'sellerId', as: 'sellerBookings' });
// Provider.hasMany(Booking, { foreignKey: 'providerId', as: 'providerBookings' });
// Service.hasMany(Booking, { foreignKey: 'serviceId', as: 'bookings' });
// Booking.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
// // Booking.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
// Booking.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });
// Booking.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

// // Review associations
// User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
// Service.hasMany(Review, { foreignKey: 'serviceId', as: 'reviews' });
// Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
// Review.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

// // Add PostgreSQL-specific full-text search functionality for Service model
// // db/index.js - Fixed setupFullTextSearch function
// const setupFullTextSearch = async () => {
//   try {
//     // Step 1: Create extension and add column (These parts are safe)
//     await sequelize.query(`
//       CREATE EXTENSION IF NOT EXISTS pg_trgm;
      
//       ALTER TABLE "Services" ADD COLUMN IF NOT EXISTS search_vector tsvector;
//     `);

//     // Step 2: Update existing records
//     await sequelize.query(`
//       UPDATE "Services" SET search_vector =
//         setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
//         setweight(to_tsvector('english', coalesce("desc", '')), 'A') ||
//         setweight(to_tsvector('english', coalesce("shortTitle", '')), 'A') ||
//         setweight(to_tsvector('english', coalesce("shortDesc", '')), 'B') ||
//         setweight(to_tsvector('english', coalesce(cat, '')), 'C') ||
//         setweight(to_tsvector('english', coalesce(array_to_string(features, ' '), '')), 'B');
//     `);

//     // Step 3: Create index
//     await sequelize.query(`
//       CREATE INDEX IF NOT EXISTS services_search_idx ON "Services" USING GIN(search_vector);
//     `);

//     // Step 4: Create trigger function
//     await sequelize.query(`
//       CREATE OR REPLACE FUNCTION services_search_vector_update() RETURNS trigger AS $$
//       BEGIN
//         NEW.search_vector = 
//           setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
//           setweight(to_tsvector('english', coalesce(NEW."desc", '')), 'A') ||
//           setweight(to_tsvector('english', coalesce(NEW."shortTitle", '')), 'A') ||
//           setweight(to_tsvector('english', coalesce(NEW."shortDesc", '')), 'B') ||
//           setweight(to_tsvector('english', coalesce(NEW.cat, '')), 'C') ||
//           setweight(to_tsvector('english', coalesce(array_to_string(NEW.features, ' '), '')), 'B');
//         RETURN NEW;
//       END;
//       $$ LANGUAGE plpgsql;
//     `);

//     // Step 5: Create trigger (separate from function)
//     await sequelize.query(`
//       DROP TRIGGER IF EXISTS services_search_vector_trigger ON "Services";
      
//       CREATE TRIGGER services_search_vector_trigger
//       BEFORE INSERT OR UPDATE ON "Services"
//       FOR EACH ROW EXECUTE FUNCTION services_search_vector_update();
//     `);
    
//     console.log('Full-text search setup completed');
//   } catch (error) {
//     console.error('Error setting up full-text search:', error);
//   }
// };

// export {
//   sequelize,
//   User,
//   Provider,
//   Service,
//   Booking,
//   Review,
//   Wishlist,
//   Category,
//   setupFullTextSearch
// };

// db/index.js
import sequelize from "../config/database.js";
import UserModel from '../models/User.js';
import ProviderModel from '../models/Provider.js';
import ServiceModel from '../models/Service.js';
import BookingModel from '../models/Booking.js';
import ReviewModel from '../models/Review.js';
//import WishlistModel from '../models/Wishlist.js'; // Keep for migration purposes
import CategoryModel from '../models/Category.js';

// Initialize models
const User = UserModel(sequelize);
const Provider = ProviderModel(sequelize);
const Service = ServiceModel(sequelize);
const Booking = BookingModel(sequelize);
const Review = ReviewModel(sequelize);
//const Wishlist = WishlistModel(sequelize); // Keep for migration purposes
const Category = CategoryModel(sequelize);

// Define associations
// User - Provider association (One-to-One)
User.hasOne(Provider, { foreignKey: 'userId', as: 'provider' });
Provider.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Provider - Service association (One-to-Many)
Provider.hasMany(Service, { foreignKey: 'providerId', as: 'services' });
Service.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });

// Category - Service association (One-to-Many)
Category.hasMany(Service, { foreignKey: 'categoryId', as: 'services' });
Service.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// // Wishlist (Many-to-Many) - Temporarily keep for migration, will be removed after migration
// User.belongsToMany(Service, { 
//   through: Wishlist, 
//   foreignKey: 'userId',
//   otherKey: 'serviceId',
//   as: 'wishedServices' 
// });

// Service.belongsToMany(User, { 
//   through: Wishlist, 
//   foreignKey: 'serviceId',
//   otherKey: 'userId',
//   as: 'wishingUsers' 
// });

// Booking associations - Updated to include Provider
User.hasMany(Booking, { foreignKey: 'buyerId', as: 'buyerBookings' });
Provider.hasMany(Booking, { foreignKey: 'providerId', as: 'providerBookings' });
Service.hasMany(Booking, { foreignKey: 'serviceId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Booking.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });
Booking.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

// Review associations
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Service.hasMany(Review, { foreignKey: 'serviceId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Review.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

// Migration function to move wishlist data from separate table to User table
const migrateWishlistData = async () => {
  try {
   //console.log('Starting wishlist migration...');
    
    // First, sync the User model to ensure the new column is created
    //console.log('Syncing User model to add wishlistServices column...');
    //await User.sync({ alter: true });
   // console.log('User model synced successfully');

    // Check if Wishlist table exists
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Wishlists'
      );
    `);
    
    if (!results[0].exists) {
      //console.log('Wishlist table does not exist, skipping migration');
      return;
    }

    // Verify the column was created
    const [columnCheck] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Users' 
      AND column_name = 'wishlistServices';
    `);

    if (columnCheck.length === 0) {
      //console.log('Column wishlistServices not found, creating manually...');
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN "wishlistServices" INTEGER[] DEFAULT '{}';
      `);
      //console.log('Column wishlistServices created manually');
    }

    // Get all wishlist data grouped by userId
    const [wishlistData] = await sequelize.query(`
      SELECT "userId", array_agg("serviceId") as service_ids
      FROM "Wishlists"
      GROUP BY "userId";
    `);

    if (wishlistData.length === 0) {
      //console.log('No wishlist data found to migrate');
      return;
    }

    // Update each user with their wishlist services
    for (const row of wishlistData) {
      await sequelize.query(`
        UPDATE "Users" 
        SET "wishlistServices" = :serviceIds
        WHERE id = :userId;
      `, {
        replacements: {
          serviceIds: row.service_ids,
          userId: row.userId
        }
      });
    }

    //console.log(`Migrated wishlist data for ${wishlistData.length} users`);
    
    // Verify migration
    const [verifyData] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM "Users" 
      WHERE "wishlistServices" IS NOT NULL 
      AND array_length("wishlistServices", 1) > 0;
    `);
    
    //console.log(`Verification: ${verifyData[0].count} users have wishlist data`);
    

  } catch (error) {
    console.error('Error during wishlist migration:', error);
    throw error;
  }
};

// Add PostgreSQL-specific full-text search functionality for Service model
const setupFullTextSearch = async () => {
  try {
    // Step 1: Create extension and add column (These parts are safe)
    await sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      
      ALTER TABLE "Services" ADD COLUMN IF NOT EXISTS search_vector tsvector;
    `);

    // Step 2: Update existing records
    await sequelize.query(`
      UPDATE "Services" SET search_vector =
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce("desc", '')), 'A') ||
        setweight(to_tsvector('english', coalesce("shortTitle", '')), 'A') ||
        setweight(to_tsvector('english', coalesce("shortDesc", '')), 'B') ||
        setweight(to_tsvector('english', coalesce(cat, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(array_to_string(features, ' '), '')), 'B');
    `);

    // Step 3: Create index
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS services_search_idx ON "Services" USING GIN(search_vector);
    `);

    // Step 4: Create trigger function
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION services_search_vector_update() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector = 
          setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(NEW."desc", '')), 'A') ||
          setweight(to_tsvector('english', coalesce(NEW."shortTitle", '')), 'A') ||
          setweight(to_tsvector('english', coalesce(NEW."shortDesc", '')), 'B') ||
          setweight(to_tsvector('english', coalesce(NEW.cat, '')), 'C') ||
          setweight(to_tsvector('english', coalesce(array_to_string(NEW.features, ' '), '')), 'B');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Step 5: Create trigger (separate from function)
    await sequelize.query(`
      DROP TRIGGER IF EXISTS services_search_vector_trigger ON "Services";
      
      CREATE TRIGGER services_search_vector_trigger
      BEFORE INSERT OR UPDATE ON "Services"
      FOR EACH ROW EXECUTE FUNCTION services_search_vector_update();
    `);
    
    console.log('Full-text search setup completed');
  } catch (error) {
    console.error('Error setting up full-text search:', error);
  }
};

export {
  sequelize,
  User,
  Provider,
  Service,
  Booking,
  Review,
  //Wishlist, // Keep for migration purposes, remove after migration
  Category,
  setupFullTextSearch,
  migrateWishlistData // Export the migration function
};