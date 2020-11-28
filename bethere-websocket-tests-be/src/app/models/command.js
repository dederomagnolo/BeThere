const mongoose = require('../../database');

const CommandSchema = new mongoose.Schema({
    commandName: {
        type: String,
        require: true
    },
    value: {
        type: String,
        required: true,
    },
    changedFrom: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const Command = mongoose.model('Command', CommandSchema);

module.exports = Command;