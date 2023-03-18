const express = require('express');
const multer = require('multer');
const productsController = require('../../controllers/products.controller');
const auth = require('../../middlewares/auth');

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
router.post(
  '/',
  auth('forAdmin'),
  upload.fields([{ name: 'image' }, { name: 'title' }, { name: 'tagline' }, { name: 'description' }]),
  productsController.createProduct
);
router.get('/', auth(), productsController.getProducts);

module.exports = router;
