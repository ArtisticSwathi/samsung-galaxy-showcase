const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Samsung Galaxy Showcase Backend API is running',
    timestamp: new Date()
  });
});

module.exports = app;
