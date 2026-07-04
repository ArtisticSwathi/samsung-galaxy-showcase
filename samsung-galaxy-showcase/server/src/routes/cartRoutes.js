const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes under this router
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(removeFromCart);

router.put('/quantity', updateCartQuantity);
router.delete('/clear', clearCart);

module.exports = router;
