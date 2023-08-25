const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  resumeUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
});

// Create an instance of the HistoryModel
const HistoryModel = mongoose.model('History', historySchema);

module.exports = HistoryModel;
