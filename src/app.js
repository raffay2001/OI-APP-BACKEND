const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const { Class } = require('./models/class.model');
const { createReadStream } = require('fs');
const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);



let bucket;
let db;
mongoose.connection.on('connected', () => {
  db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'videos',
  });
  console.log(bucket);
});

// v2 api routes for class upload
// app.post('/classes', upload.single('video'), async (req, res) => {
//   try {
//     // Create a new Class object
//     const newClass = new Class({
//       title: 'sadasd',
//       description: 'asdsad',
//     });

//     // Save the Class object to the database
//     const savedClass = await newClass.save();

//     // Create a new GridFSBucket object to handle video uploads

//     // Create a readable stream from the uploaded file
//     const stream = createReadStream(path.join(__dirname + '/uploads/' + req.file.filename));

//     // Create a new GridFS file with the correct class ID
//     const uploadStream = bucket.openUploadStreamWithId(savedClass._id, req.file.originalname);

//     // Pipe the stream to the GridFS file
//     stream.pipe(uploadStream);

//     // Wait for the upload to finish
//     await new Promise((resolve, reject) => {
//       uploadStream.on('error', reject);
//       uploadStream.on('finish', resolve);
//     });

//     // Respond with success message
//     res.send('Class and video uploaded successfully!');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Something went wrong');
//   }
// });

// app.get('/streamvideo', function (req, res) {
//   // Check for range headers to find our start time
//   const range = req.headers.range;
//   if (!range) {
//     res.status(400).send('Requires Range header');
//   }

//   // GridFS Collection
//   db.collection('videos.files').findOne(
//     { filename: 'Tere Mere - Stebin Ben Ft Gurmeet Choudhary_HD-(Hd9video).mp4' },
//     (err, video) => {
//       if (!video) {
//         res.status(404).send('No video uploaded!');
//         return;
//       }
//       console.log('part a 2');

//       // Create response headers
//       const videoSize = video.length;
//       const start = Number(range.replace(/\D/g, ''));
//       const end = videoSize - 1;
//       console.log('part a 3');

//       const contentLength = end - start + 1;
//       const headers = {
//         'Content-Range': `bytes ${start}-${end}/${videoSize}`,
//         'Accept-Ranges': 'bytes',
//         'Content-Length': contentLength,
//         'Content-Type': 'video/mp4',
//       };

//       // HTTP Status 206 for Partial Content
//       res.writeHead(206, headers);
//       console.log('part a 1');
//       // // Get the bucket and download stream from GridFS
//       // const bucket = new mongodb.GridFSBucket(db);
//       const downloadStream = bucket.openDownloadStreamByName(
//         'Tere Mere - Stebin Ben Ft Gurmeet Choudhary_HD-(Hd9video).mp4',
//         {
//           start,
//         }
//       );

//       // Finally pipe video to response
//       downloadStream.pipe(res);
//     }
//   );
// });

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = { app };
