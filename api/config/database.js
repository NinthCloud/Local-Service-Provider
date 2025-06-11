import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "postgres",
  logging: false, // Set to true for debugging queries
});

async function testConnection() {
    try {
      await sequelize.authenticate();
      console.log("✅ PostgreSQL connected successfully!");
    } catch (error) {
      console.error("❌ Unable to connect to PostgreSQL:", error);
    }
  }
  
  testConnection();

export default sequelize;
