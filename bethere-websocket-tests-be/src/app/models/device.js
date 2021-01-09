const mongoose = require('../../database');

const DeviceSchema = new mongoose.Schema({
    deviceSerialKey: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: String,
        require: require
    },
    deviceName: {
        type: String,
        require: false
    },
    settings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Settings',  require: false}]
});

const Device = mongoose.model('Device', DeviceSchema);

module.exports = Device;