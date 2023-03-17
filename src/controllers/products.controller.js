const { productModel, imageModel } = require('../models/product.model');
const fs = require('fs');
const path = require('path');
const catchAsync = require('../utils/catchAsync');

const createProduct = catchAsync(async (req, res) => {
  try {
    const { title, tagline, description } = req.body;
    const newProduct = new productModel({
      title,
      tagline,
      description,
    });
    await newProduct.save();
    const srcDir = path.join(__dirname, '../');
    const newImage = new imageModel({
      img: {
        data: fs.readFileSync(path.join(srcDir + '/uploads/' + req.files['image'][0].filename)),
        contentType: 'image/png',
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
  res.json(products);
};

module.exports = {
  createProduct,
  getProducts,
};
