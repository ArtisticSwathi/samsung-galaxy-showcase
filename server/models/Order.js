import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
