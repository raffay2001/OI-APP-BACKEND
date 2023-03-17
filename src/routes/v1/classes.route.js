const express = require('express');
const multer = require('multer');
const classesController = require('../../controllers/classes.controller');

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
  upload.fields([{ name: 'video' }, { name: 'thumbnail' }, { name: 'title' }, { name: 'description' }]),
  classesController.createClass
);
router.get('/', classesController.getAllClasses);
router.get('/:classId', classesController.getClassById);
router.get('/:className', classesController.getClass);
router.get('/:group', classesController.getClassByGroup);

module.exports = router;
