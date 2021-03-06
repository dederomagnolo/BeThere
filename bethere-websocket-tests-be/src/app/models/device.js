const mongoose = require('../../database');

const DeviceSchema = new mongoose.Schema({
    deviceSerialKey: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: false
    },
    deviceName: {
        type: String,
        required: false
    },
    settings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Settings',  require: false}],
    available: {
        type: Boolean,
        default: true
    },
    planType: {
        type: String,
        required: false,
    },
});

const Device = mongoose.model('Device', DeviceSchema);

module.exports = Device;