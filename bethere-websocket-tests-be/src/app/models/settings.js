const mongoose = require('../../database');

const SettingsSchema = new mongoose.Schema({
    userId: {
        type: String,
        require: true
    },
    deviceId:{
        type: String,
        require: true
    },
    settingsName: {
        type: String,
        require: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    backlight: {
        type: Number,
        require:false,
        default: 22
    },
    pumpTimer: {
        type: Number,
        require: false,
        default: 10 //mins
    },
    localMeasureInterval: {
        type: Number,
        require: false,
        default: 10 //seconds
    },
    remoteMeasureInterval: {
        type: Number,
        require: false,
        default: 15 //mins
    }
});

const Settings = mongoose.model('Settings', SettingsSchema);

module.exports = Settings;