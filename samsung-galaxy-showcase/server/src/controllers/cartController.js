const User = require('../models/User');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ items: user.cart || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, name, price, color, storage, image, quantity = 1 } = req.body;

    if (!productId || !name || price === undefined) {
      return res.status(400).json({ message: 'Product ID, name, and price are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the exact item configuration already exists in the cart
    const existingItemIndex = user.cart.findIndex(
      (item) =>
        item.productId === productId &&
        item.color === color &&
        item.storage === storage
    );

    if (existingItemIndex > -1) {
      user.cart[existingItemIndex].quantity += Number(quantity);
    } else {
      user.cart.push({
        productId,
        name,
        price,
        color,
        storage,
        image,
        quantity: Number(quantity)
      });
    }

    await user.save();
    res.json({ items: user.cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/quantity
// @access  Private
exports.updateCartQuantity = async (req, res, next) => {
  try {
    const { productId, color, storage, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const itemIndex = user.cart.findIndex(
      (item) =>
        item.productId === productId &&
        item.color === color &&
        item.storage === storage
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    user.cart[itemIndex].quantity = Math.max(1, Number(quantity));
    await user.save();

    res.json({ items: user.cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId, color, storage } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = user.cart.filter(
      (item) =>
        !(
          item.productId === productId &&
          item.color === color &&
          item.storage === storage
        )
    );

    await user.save();
    res.json({ items: user.cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = [];
    await user.save();

    res.json({ items: [] });
  } catch (error) {
    next(error);
  }
};
