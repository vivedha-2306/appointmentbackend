const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  eventId: String
});

module.exports = mongoose.model("Registration", registrationSchema);
