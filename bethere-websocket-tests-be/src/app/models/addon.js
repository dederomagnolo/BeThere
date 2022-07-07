const mongoose = require('../../database');

const AddonSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  availableForPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plans',  require: true}],
  characteristics: {
    model: {
      type: String,
      required: true
    },
    resolution: {
      type: Number
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: false
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Device'
  },
  customName: {
    type: String,
    required: false
  },
  available: {
    type: Boolean,
    default: true
  },
});

const Addon = mongoose.model('Addon', AddonSchema);

module.exports = Addon;