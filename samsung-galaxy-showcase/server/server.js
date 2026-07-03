require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./src/app");
const Product = require("./src/models/Product");

// Connect to MongoDB
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ Connected to MongoDB:", conn.connection.host);

    // Seed database after successful connection
    await seedDatabase();
  } catch (error) {
    console.error("❌ MongoDB Connection Error:");
    console.error(error);
    process.exit(1);
  }
}

connectDB();

// Seed Database
async function seedDatabase() {
  try {
    const count = await Product.countDocuments();

    if (count === 0) {
      await Product.create([
        {
          name: "Samsung Galaxy S24 Ultra",
          basePrice: 1299,
          colors: ["#252627", "#E3E4E5", "#3E4A3E"],
          specs: {
            screen: "6.8 inches",
            storage: "256GB/512GB",
          },
        },
        {
          name: "Samsung Galaxy Buds3 Pro",
          basePrice: 249,
          colors: ["#FFFFFF", "#A1A5A4"],
          specs: {
            audio: "Hi-Fi Sound",
            battery: "6 hours",
          },
        },
      ]);

      console.log("📦 Sample products inserted.");
    }
  } catch (err) {
    console.error("Seed Error:", err);
  }
}

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});