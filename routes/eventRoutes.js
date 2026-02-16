const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Registration = require("../models/Registration");

// Add event (public - anyone can add)
router.post("/events", async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      organizerId: req.body.organizerId || "anonymous"
    });

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Error creating event", error: err.message });
  }
});

// Get all events (no limit)
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ _id: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Error fetching events", error: err.message });
  }
});

// Get single event
router.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Error fetching event", error: err.message });
  }
});

// Register for event
router.post("/register", async (req, res) => {
  try {
    const registration = new Registration(req.body);
    await registration.save();
    res.json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error registering", error: err.message });
  }
});

// Update event
router.put("/events/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Error updating event", error: err.message });
  }
});

// Delete event
router.delete("/events/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    // Also delete all registrations for this event
    await Registration.deleteMany({ eventId: req.params.id });
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting event", error: err.message });
  }
});

module.exports = router;
