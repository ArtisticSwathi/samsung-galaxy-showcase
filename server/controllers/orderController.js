import Order from '../models/Order.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res, next) => {
  try {
    const { items, totalAmount, shippingDetails } = req.body;

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    const order = new Order({
      items,
      totalAmount,
      shippingDetails,
      paymentStatus: 'pending'
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.productId');
    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};
