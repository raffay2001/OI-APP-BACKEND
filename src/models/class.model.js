const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Video model
const videoSchema = new Schema({
  video: {
    type: Buffer,
    required: true,
  },
  class: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
});

const Video = mongoose.model('Video', videoSchema);

// Define the Class model
const classSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  thumbnail: {
    data: Buffer,
    contentType: String,
  },
});

const Class = mongoose.model('Class', classSchema);

module.exports = { Class, Video };