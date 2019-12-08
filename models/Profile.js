const mongoose = require("mongoose");

profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  address: {
    state: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    house_no: {
      type: String,
      required: true
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Profile = mongoose.model("profile", profileSchema);
