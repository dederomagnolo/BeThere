const mongoose = require('../../database');

const PlansSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

const Plan = mongoose.model('Plan', PlansSchema);

module.exports = Plan;