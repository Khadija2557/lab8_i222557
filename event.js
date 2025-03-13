const express = require("express");
const mongoose = require("./db");
const authMiddleware = require("./authMiddleware");

const app = express();
app.use(express.json());

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ["Meeting", "Birthday", "Appointment"], required: true },
  date: { type: Date, required: true },
  reminder: { type: Boolean, default: false },
});

const Event = mongoose.model("Event", eventSchema);

// Create an event
app.post("/api/events", authMiddleware, async (req, res) => {
  try {
    const newEvent = new Event({ ...req.body, userId: req.user.id });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: "Error creating event", error });
  }
});

// Get events
app.get("/api/events", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user.id }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error });
  }
});

// Start server
const PORT = 5001;
app.listen(PORT, () => console.log(`Event service running on port ${PORT}`));
