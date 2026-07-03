const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const Product = require('./models/Product');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Product API Route
app.get('/api/products', async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Samsung Galaxy Showcase Backend API is running',
    timestamp: new Date()
  });
});

// Error handling middleware (must be registered last)
app.use(errorHandler);

module.exports = app;
