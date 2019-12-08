const mongoose = require("mongoose");

UsageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  time: {
    type: Number,
    required: true
  },
  power: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Usage = mongoose.model("usage", UsageSchema);
