const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = [
  'https://samsung-3d-showcase.vercel.app',          // old Vercel domain
  'https://samsung-galaxy-showcase-t8fu.vercel.app', // ✅ new Vercel production domain
];

// Also allow any *.vercel.app preview/deploy URL automatically
const vercelPattern = /^https:\/\/[\w-]+(\.vercel\.app)$/;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Check if the origin matches localhost with any port (e.g., http://localhost:5173, http://localhost:5174)
    const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin);
    
    if (allowedOrigins.includes(origin) || isLocalhost || vercelPattern.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS middleware globally (handles preflight OPTIONS automatically)
app.use(cors(corsOptions));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', paymentRoutes);
app.use('/api/chat', chatbotRoutes);

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
