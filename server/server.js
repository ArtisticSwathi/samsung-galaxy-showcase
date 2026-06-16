import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import Product from './models/Product.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Samsung Cinematic Showcase Server running' });
});

// Seed mock products if database is empty
const seedProducts = async () => {
  try {
    const count = await Product.countDocuments({});
    if (count === 0) {
      const defaultProducts = [
        {
          name: 'Galaxy S26 Ultra',
          description: 'Titanium framework with integrated S Pen, Snapdragon 8 Gen 5, and 200MP camera system.',
          price: 1299.99,
          color: 'Titanium Gray',
          storage: '256GB',
          stock: 50
        },
        {
          name: 'Galaxy S26+',
          description: 'Dynamic AMOLED 2X, enhanced battery life, and powerful triple-camera layout.',
          price: 999.99,
          color: 'Onyx Black',
          storage: '256GB',
          stock: 75
        },
        {
          name: 'Galaxy S26',
          description: 'Compact premium performance. Exceptional speed and all-day intelligent battery.',
          price: 799.99,
          color: 'Marble Gray',
          storage: '128GB',
          stock: 100
        }
      ];
      await Product.insertMany(defaultProducts);
      console.log('Database seeded with default Galaxy products!');
    }
  } catch (error) {
    console.error('Failed to seed products:', error.message);
  }
};
seedProducts();

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
