// migration.js - Run this script once to migrate your wishlist data
import { migrateWishlistData, sequelize, User } from './models/index.js';

async function runWishlistMigration() {
  try {
    console.log('Starting wishlist migration process...');
    
    // Ensure database connection
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    // First, let's check if the User table exists and sync it
    console.log('Checking User table structure...');
    
    // Force sync the User model to ensure the new column is added
    await User.sync({ alter: true });
    console.log('User model synchronized with new wishlistServices column');
    
    // Verify the column was created
    const [columnCheck] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Users' 
      AND column_name = 'wishlistServices';
    `);
    
    if (columnCheck.length > 0) {
      console.log('✅ wishlistServices column found:', columnCheck[0]);
    } else {
      console.log('❌ wishlistServices column not found');
      throw new Error('Column creation failed');
    }
    
    // Run the migration
    await migrateWishlistData();
    
    console.log('✅ Wishlist migration completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Test your application to ensure wishlist functionality works');
    console.log('2. Once confirmed, you can uncomment the table drop lines in migrateWishlistData()');
    console.log('3. Remove Wishlist model imports and associations from your code');
    console.log('4. Update your API routes to use the new User methods');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Run the migration
runWishlistMigration();