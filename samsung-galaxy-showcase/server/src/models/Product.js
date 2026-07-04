const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  colorName: { type: String, required: true },
  colorHex: { type: String, required: true },
  imageUrl: { type: String, required: true }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  specs: {
    display: { type: String },
    processor: { type: String },
    camera: { type: String },
    battery: { type: String }
  },
  category: { type: String, default: 'newly-launched' },
  variants: [variantSchema],
  storages: [{ size: String, priceModifier: Number }],
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
