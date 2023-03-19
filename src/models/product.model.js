const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = mongoose.Schema({
  title: {
    type: String,
    required: false,
    trim: true,
  },
  tagline: {
    type: String,
    required: false,
    trim: true,
  },
price: {
    type: String,
    required: false,
    trim: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
});

const imageSchema = mongoose.Schema({
  img: {
    data: Buffer,
    contentType: String,
  },
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
});

const productModel = new mongoose.model('Product', productSchema);
const imageModel = new mongoose.model('Image', imageSchema);
module.exports = {
  productModel,
  imageModel,
};
