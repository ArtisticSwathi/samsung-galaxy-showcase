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
    // Clear existing products to ensure new schema is populated
    await Product.deleteMany({});

    await Product.create([
      {
        name: "Samsung Galaxy S26 5G",
        price: 999.00,
        description: "Android 16, 12 GB RAM, 3.8 GHz CPU, AI Phone, Photo Assist, Creative Studio, 50MP Camera with ProVisual Engine, 4300mAh Battery.",
        category: "newly-launched",
        variants: [
          { colorName: "Cobalt Violet", colorHex: "#5E3A8C", imageUrl: "https://res.cloudinary.com/nhnjtao6/image/upload/v1783147479/S26_purple_dvnzbp.jpg" },
          { colorName: "Black", colorHex: "#1C1C1E", imageUrl: "https://res.cloudinary.com/nhnjtao6/image/upload/v1783146851/Samsung_-1_k8duze.jpg" }
        ],
        storages: [
          { size: "256GB", priceModifier: 0 },
          { size: "512GB", priceModifier: 120 }
        ],
        specs: {
          display: '6.2" Dynamic AMOLED 2X, FHD+, 120Hz',
          camera: '50MP Main Camera with ProVisual Engine',
          processor: 'Octa-Core 3.8 GHz CPU',
          battery: '4300mAh Battery with Super Fast Charging'
        },
        createdAt: new Date("2026-01-10")
      },
      {
        name: "Samsung Galaxy Z Fold7 5G",
        price: 2249.00, // Dollar equivalent of ₹1,86,999.00
        description: "Android 16.0, 12 GB RAM, Snapdragon 8 Elite, 4.47 GHz, 200MP Camera, Ultra-Smooth Gaming, Google Gemini.",
        category: "newly-launched",
        variants: [
          { colorName: "Silver Shadow", colorHex: "#D1D5DB", imageUrl: "https://res.cloudinary.com/nhnjtao6/image/upload/v1783146982/foldable_mobile_next_color_sq7htq.jpg" },
          { colorName: "JetBlack", colorHex: "#111111", imageUrl: "https://res.cloudinary.com/nhnjtao6/image/upload/v1783146926/Foldable_mobile_snbi2f.jpg" }
        ],
        storages: [
          { size: "256GB", priceModifier: 0 },
          { size: "512GB", priceModifier: 150 },
          { size: "1TB", priceModifier: 350 }
        ],
        specs: {
          display: '7.6" Main Screen Dynamic AMOLED 2X, 120Hz Foldable',
          camera: '200MP Camera with advanced Nightography',
          processor: 'Snapdragon 8 Elite, 4.47 GHz',
          battery: '4400 mAh intelligent dual battery with 25W Fast Charging'
        },
        createdAt: new Date("2026-07-04")
      },
      {
        name: "Samsung Galaxy S25 Ultra 5G",
        price: 1025.00, // Dollar equivalent of ₹84,999.00
        description: "Android 15.0, 12 GB RAM, Snapdragon 8 Elite, 4.47 GHz, 200MP Camera, S Pen Included, Long Battery Life.",
        category: "newly-launched",
        variants: [
          { colorName: "Silver Blue", colorHex: "#B8C6D9", imageUrl: "https://res.cloudinary.com/nhnjtao6/image/upload/v1783148156/S26_silver_nnlvph.jpg" },
          { colorName: "Titanium Black", colorHex: "#2E3033", imageUrl: "https://res.cloudinary.com/nhnjtao6/image/upload/v1783148161/s25_black_of0bgd.jpg" }
        ],
        storages: [
          { size: "256GB", priceModifier: 0 },
          { size: "512GB", priceModifier: 120 },
          { size: "1TB", priceModifier: 320 }
        ],
        specs: {
          display: '6.8" Flat Dynamic AMOLED 2X, QHD+, 120Hz',
          camera: '200MP Main Camera with advanced Galaxy AI Nightography',
          processor: 'Snapdragon 8 Elite, 4.47 GHz, customized clock speeds',
          battery: '5000 mAh Intelligent Battery with 45W Fast Charging'
        },
        createdAt: new Date("2025-01-31")
      }
    ]);

    console.log("📦 Sample products inserted successfully.");
  } catch (err) {
    console.error("Seed Error:", err);
  }
}

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});