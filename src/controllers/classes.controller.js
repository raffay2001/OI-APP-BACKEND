const { Class, Thumbnail } = require('../models/class.model');
const { createReadStream } = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');

let bucket;
let db;
mongoose.connection.on('connected', () => {
  db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'videos',
  });
});

const createClass = async (req, res) => {
  try {
    const { title, description, group } = req.body;
    console.log(req.files);

    const srcDir = path.join(__dirname, '../');
    // Create a new Class object
    console.log(req.files);
    const newClass = new Class({
      title,
      description,
      group,
      // thumbnail: {
      //   data: fs.readFileSync(path.join(srcDir + '/uploads/' + req.files['thumbnail'][0].filename)),
      //   contentType: 'image/*',
      // },
      filename: req.files['video'][0].originalname,
    });
    const newThumbnail = new Thumbnail({
      thumbnailpic: {
        data: fs.readFileSync(path.join(srcDir + '/uploads/' + req.files['thumbnail'][0].filename)),
        contentType: 'image/*',
      },
      class: newClass._id,
    });
    await newThumbnail.save();

    // Save the Class object to the database
    const savedClass = await newClass.save();

    // Create a new GridFSBucket object to handle video uploads

    // Create a readable stream from the uploaded file
    const stream = createReadStream(path.join(srcDir + '/uploads/' + req.files['video'][0].filename));

    // Create a new GridFS file with the correct class ID
    const uploadStream = bucket.openUploadStreamWithId(savedClass._id, req.files['video'][0].originalname);

    // Pipe the stream to the GridFS file
    stream.pipe(uploadStream);

    // Wait for the upload to finish
    await new Promise((resolve, reject) => {
      uploadStream.on('error', reject);
      uploadStream.on('finish', resolve);
    });

    // Respond with success message
    res.json({ message: 'Class and video uploaded successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

const getClass = async (req, res) => {
  const { className } = req.params;
  // Check for range headers to find our start time

  // GridFS Collection
  db.collection('videos.files').findOne({ filename: className }, (err, video) => {
    console.log(video);
    if (!video) {
      res.status(404).json({ message: 'No video found' });
      return;
    }

    // Create response headers
    const videoSize = video.length;
    const start = 0;
    const end = videoSize - 1;

    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);
    // // Get the bucket and download stream from GridFS
    // const bucket = new mongodb.GridFSBucket(db);
    const downloadStream = bucket.openDownloadStreamByName(className, {
      start,
    });

    // Finally pipe video to response
    downloadStream.pipe(res);
  });
};
const getAllClasses = async (req, res) => {
  try {
    const allClasses = await Class.aggregate([
      {
        $lookup: {
          from: 'thumbnails',
          localField: '_id',
          foreignField: 'class',
          as: 'result',
        },
      },
    ]);
    res.status(200).send(allClasses);
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
};

const getClassById = async (req, res) => {
  try {
    const { classId } = req.params;
    const classDoc = await Class.aggregate([
      {
        '$match': {
          '_id': new ObjectId(classId)
        }
      }, {
        '$lookup': {
          'from': 'thumbnails',
          'localField': '_id',
          'foreignField': 'class',
          'as': 'thumbnails'
        }
      }
    ]);
    res.status(200).send(classDoc[0]);
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
};

const getClassByGroup = async (req, res) => {
  try {
    const { group } = req.params;
    const classDoc = await Class.find({ group: group });
    res.status(200).send(classDoc);
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
};

module.exports = { createClass, getClass, getAllClasses, getClassById, getClassByGroup };
