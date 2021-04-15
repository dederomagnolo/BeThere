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
        type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true
    },
    deviceName: {
        type: String,
        required: false
    },
    settings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Settings',  require: false}]
});

const Device = mongoose.model('Device', DeviceSchema);

module.exports = Device;