const mongoose = require("../../database");

const CommandSchema = new mongoose.Schema({
  commandName: {
    type: String,
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  deviceId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  value: {
    type: String,
  },
  changedFrom: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Command = mongoose.model("Command", CommandSchema);

module.exports = Command;
