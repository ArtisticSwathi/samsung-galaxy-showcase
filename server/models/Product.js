import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  color: {
    type: String,
    required: true
  },
  storage: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  stock: {
    type: Number,
    required: true,
    default: 100
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;
