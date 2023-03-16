const express = require('express');
const multer = require('multer');
const productsController = require('../../controllers/products.controller');

// multer code
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './src/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now());
  },
});
const upload = multer({ storage: storage });

const router = express.Router();
router.post('/', upload.single('image'), productsController.createProduct);
router.get('/', productsController.getProducts);

module.exports = router;
