const mongoose = require('../../database');

const MeasureSchema = new mongoose.Schema({
    measureName: {
        type: String,
        require: true
    },
    value: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const Measure = mongoose.model('Measure', MeasureSchema);

module.exports = Measure;