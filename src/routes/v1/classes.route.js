const express = require('express');
const multer = require('multer');
const classesController = require('../../controllers/classes.controller');
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
  upload.fields([{ name: 'video' }, { name: 'thumbnail' }, { name: 'title' }, { name: 'description' }, { name: 'group' }]),
  classesController.createClass
);
router.get('/', auth(), classesController.getAllClasses);
router.get('/:classId', auth(), classesController.getClassById);
router.get('/stream/:className', auth(), classesController.getClass);
router.get('/group/:group', auth(), classesController.getClassByGroup);

module.exports = router;
