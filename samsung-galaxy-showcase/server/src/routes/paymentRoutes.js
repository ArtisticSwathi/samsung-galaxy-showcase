const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// Read .env directly with fs to bypass dotenvx interception issues
// dotenvx sometimes only injects 4 vars and misses STRIPE_SECRET_KEY on reloads
const envPath = path.resolve(__dirname, '../../.env');
const envVars = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex > -1) {
          const key = trimmed.substring(0, eqIndex).trim();
          const val = trimmed.substring(eqIndex + 1).trim();
          envVars[key] = val;
        }
      }
    });
}

// Use fs-read value first, fall back to process.env
const STRIPE_SECRET_KEY = envVars.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

// Initialize Stripe with the directly-read key
const stripe = require('stripe')(STRIPE_SECRET_KEY);

// Helper to securely calculate the total order amount from the DB
const calculateOrderAmount = async (items) => {
  let subtotal = 0;
  for (const item of items) {
    // Fetch product from DB to ensure secure pricing
    const dbProduct = await Product.findById(item.id || item._id);
    if (!dbProduct) {
      throw new Error(`Product not found: ${item.id}`);
    }
    
    // Find the correct storage price modifier
    const storageOption = dbProduct.storages.find(s => s.size === item.storage);
    const modifier = storageOption ? storageOption.priceModifier : 0;
    
    const itemPrice = dbProduct.price + modifier;
    subtotal += itemPrice * item.quantity;
  }
  
  // Calculate subtotal + 8% estimated tax
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  
  // Return the total in the smallest currency unit (paise for INR)
  return Math.round(total * 100);
};

router.post('/create-payment-intent', async (req, res, next) => {
  try {
    const { items } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    
    const amount = await calculateOrderAmount(items);
    
    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'inr',
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: amount
    });
  } catch (error) {
    console.error("Stripe PaymentIntent Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
