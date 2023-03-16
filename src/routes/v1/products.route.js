const express = require('express');
const multer = require('multer');
const productsController = require('../../controllers/products.controller');
const { upload } = require('../../app');

const router = express.Router();
// router.post('/', upload.single('image'), productsController.createProduct); 
router.get('/', productsController.getProducts);

module.exports = router;
