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
  group: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  // thumbnail: {
  //   data: Buffer,
  //   contentType: String,
  // },
});


// Define the Class model
const ThumbnailSchema = new Schema({
  thumbnailpic: {
    data: Buffer,
    contentType: String,
  },
  class: { type: Schema.Types.ObjectId, ref: 'Class' },

})
const Class = mongoose.model('Class', classSchema);
const Thumbnail = mongoose.model('Thumbnail', ThumbnailSchema);

module.exports = { Class, Video, Thumbnail };
