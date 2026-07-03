const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  basePrice: Number,
  colors: [String],
  specs: Object,
});

module.exports = mongoose.model('Product', productSchema);
