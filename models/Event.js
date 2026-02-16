const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  location: String,
  contactInfo: String,
  organizerId: String
});

module.exports = mongoose.model("Event", eventSchema);
