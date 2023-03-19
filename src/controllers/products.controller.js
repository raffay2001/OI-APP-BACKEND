const { productModel, imageModel } = require('../models/product.model');
const fs = require('fs');
const path = require('path');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const createProduct = catchAsync(async (req, res) => {
  try {
    const { title, tagline, description, price } = req.body;
    const newProduct = new productModel({
      title,
      tagline,
      description,
      price,
    });
    await newProduct.save();
    const srcDir = path.join(__dirname, '../');
    const newImage = new imageModel({
      img: {
        data: fs.readFileSync(path.join(srcDir + '/uploads/' + req.files['image'][0].filename)),
        contentType: 'image/*',
      },
      product: newProduct._id,
    });
    await newImage.save();
    const response = await productModel.findOne({ _id: newProduct._id });
    res.status(201).json({ response, images: [newImage] });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

const getProducts = async (req, res) => {
  try {
    const products = await productModel.aggregate([
      {
        $lookup: {
          from: 'images',
          localField: '_id',
          foreignField: 'product',
          as: 'results',
        },
      },
    ]);
    res.status(200).json(products);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const deleteProductById = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.productId);
    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No Product Found');
    }
    product.remove();
    res.status(httpStatus.NO_CONTENT).json();
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await productModel.findById(productId);
    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Product not found.');
    }
    return res.json(product);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const updateProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await productModel.findById(productId);
    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Product not found.');
    }
    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (e) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: e.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  deleteProductById,
  getProductById,
  updateProductById,
};
