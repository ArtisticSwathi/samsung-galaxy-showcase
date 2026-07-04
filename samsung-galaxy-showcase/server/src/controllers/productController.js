const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get newly launched products
// @route   GET /api/products/newly-launched
// @access  Public
exports.getNewlyLaunched = async (req, res, next) => {
  try {
    const products = await Product.find({ category: 'newly-launched' })
      .sort({ createdAt: -1 })
      .limit(3);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

