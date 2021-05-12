const mongoose = require('../../database');

const SettingsSchema = new mongoose.Schema({
    deviceId:{
        type: String,
        required: true
    },
    settingsName: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    backlight: {
        type: Number,
        required:false,
        default: 22 //hrs?
    },
    pumpTimer: {
        type: Number,
        required: false,
        default: 10 //mins
    },
    localMeasureInterval: {
        type: Number,
        required: false,
        default: 5 //seconds
    },
    remoteMeasureInterval: {
        type: Number,
        required: false,
        default: 15 //mins
    },
    wateringRoutine: {
        enabled: {
            type: Boolean,
            required: true,
            default: false
        },
        startTime: {
            type: Number
        },
        endTime: {
            type: Number
        },
        interval: {
            type: Number
        },
        duration: {
            type: Number
        } 
    }
});

const Settings = mongoose.model('Settings', SettingsSchema);

module.exports = Settings;