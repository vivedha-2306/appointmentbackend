const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Registration = require("../models/Registration");

const { protect } = require("../middleware/auth");
const { adminOnly, loggedInOnly } = require("../middleware/roles");

// Public routes
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Error fetching events" });
  }
});

router.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Error fetching event" });
  }
});

// Logged-in user routes
router.post("/register", protect, loggedInOnly, async (req, res) => {
  try {
    const { eventId, name, email, phone } = req.body;

    if (!eventId) return res.status(400).json({ message: "Event ID is required" });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const alreadyRegistered = await Registration.findOne({
      eventId,
      email: email || req.user.email
    });

    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered for this event" });
    }

    const registration = new Registration({
      name: name || req.user.name,
      email: email || req.user.email,
      phone,
      eventId,
      userId: req.user._id
    });

    await registration.save();
    res.status(201).json({ message: "Registered successfully", registration });
  } catch (err) {
    res.status(500).json({ message: "Error registering", error: err.message });
  }
});

// Admin only routes
router.post("/events", protect, adminOnly, async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      organizerId: req.user._id || 'admin-fixed'
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: "Error creating event", error: err.message });
  }
});

router.put("/events/:id", protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: "Error updating event" });
  }
});

router.delete("/events/:id", protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    await Event.findByIdAndDelete(req.params.id);
    await Registration.deleteMany({ eventId: req.params.id });

    res.json({ message: "Event and registrations deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting event" });
  }
});

// Optional admin dashboard
router.get("/dashboard", protect, adminOnly, async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const recentEvents = await Event.find().sort({ _id: -1 }).limit(5);

    res.json({ stats: { totalEvents, totalRegistrations }, recentEvents });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard" });
  }
});

module.exports = router;