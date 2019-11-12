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
  }
});

module.exports = Usage = mongoose.model("usage", UsageSchema);
