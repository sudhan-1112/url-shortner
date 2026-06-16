const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  browser: {
    type: String
  },
  device: {
    type: String
  },
  country: {
    type: String,
    default: 'Unknown'
  },
  city: {
    type: String,
    default: 'Unknown'
  }
});

module.exports = mongoose.model('Visit', VisitSchema);
