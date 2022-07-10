const mongoose = require('../../database');

const MeasureSchema = new mongoose.Schema({
  measureName: {
    type: String,
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Measure = mongoose.model('Measure', MeasureSchema);

module.exports = Measure;