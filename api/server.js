import express from "express";
import dotenv from "dotenv";
import path from "path"; // ✅ Required to resolve paths
import userRoute from "./routes/user.route.js";
import categoryRoute from "./routes/category.route.js";
import serviceRoute from "./routes/service.route.js";
import bookingRoute from "./routes/booking.route.js";
import reviewRoute from "./routes/review.route.js";
import authRoute from "./routes/auth.route.js";
import wishlistRoute from "./routes/wishlsit.route.js";
import adminRoutes from "./routes/admin.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import cron from "node-cron";
import expirePastOrders from "./utils/expireOrders.js";
import removeExpiredSlots from "./utils/removeExpiredSlots.js";

import { sequelize, setupFullTextSearch } from "./models/index.js"; // ✅ Import Sequelize and Models

// 🛠️ Sync database (register models and relationships)
const forceUpdateSearchVectors = async () => {
  try {
    // Make sure the column exists
    await sequelize.query(`
      ALTER TABLE "Services" ADD COLUMN IF NOT EXISTS search_vector tsvector;
    `);
    // Update all existing records - All columns are quoted
    const result = await sequelize.query(`
      UPDATE "Services" SET search_vector =
        setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
        setweight(to_tsvector('english', coalesce("desc", '')), 'A') ||
        setweight(to_tsvector('english', coalesce("shortTitle", '')), 'A') ||
        setweight(to_tsvector('english', coalesce("shortDesc", '')), 'B') ||
        setweight(to_tsvector('english', coalesce("cat", '')), 'C') ||
        setweight(to_tsvector('english', coalesce(array_to_string("features", ' '), '')), 'B')
      WHERE search_vector IS NULL;
    `);

  } catch (error) {
    console.error("Error updating search vectors:", error);
  }
};

const checkAndFixSearchVectors = async () => {
  try {
    // Count services with null search_vector
    const [nullVectorResult] = await sequelize.query(`
      SELECT COUNT(*) FROM "Services" WHERE search_vector IS NULL
    `);

    const nullVectorCount = parseInt(nullVectorResult[0].count, 10);

    if (nullVectorCount > 0) {
      // Update null search vectors
      const [updateResult] = await sequelize.query(`
        UPDATE "Services" 
        SET search_vector =
          setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce("desc", '')), 'A') ||
          setweight(to_tsvector('english', coalesce("shortTitle", '')), 'A') ||
          setweight(to_tsvector('english', coalesce("shortDesc", '')), 'B') ||
          setweight(to_tsvector('english', coalesce(cat, '')), 'C') ||
          setweight(to_tsvector('english', coalesce(array_to_string(features, ' '), '')), 'B')
        WHERE search_vector IS NULL
      `);
    }

    return {
      nullVectorCount,
      fixed: nullVectorCount,
    };
  } catch (error) {
    console.error("Error checking/fixing search vectors:", error);
    throw error;
  }
};

// After connecting to the database
sequelize
  .sync({force: false})
  .then(async () => {
    console.log("Database connected successfully");
    await setupFullTextSearch();
    await forceUpdateSearchVectors();
    await checkAndFixSearchVectors();
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });

const app = express();

dotenv.config();

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully!");
  } catch (error) {
    console.error("❌ Unable to connect to PostgreSQL:", error);
  }
}

testConnection();

app.use(cors({ origin:process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/services", serviceRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoute);

// 🧱 Serve static frontend from /public
const __dirname = path.resolve(); // ✅ Needed for ES modules
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong";

  return res.status(errorStatus).send(errorMessage);
});

// ⏰ Schedule automatic expiration of past orders every hour
cron.schedule("*/5 * * * *", async () => {
  await expirePastOrders();
  await removeExpiredSlots();
});

app.listen(5000, () => {
  testConnection();
  console.log("🚀 Server is running on port 5000");
});
