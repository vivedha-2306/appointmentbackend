const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
// ────────────────────────────────────────────────
//  Put this BEFORE everything else
require("dotenv").config();   // ← move this line up here
// ────────────────────────────────────────────────

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const eventRoutes = require("./routes/eventRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Optional but very helpful for debugging
console.log("MONGO_URI from env →", process.env.MONGO_URI);          // ← add this
console.log("Type of MONGO_URI     →", typeof process.env.MONGO_URI); // ← add this

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in environment variables!");
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  // Recommended modern options (most of the old ones are deprecated)
  // useNewUrlParser: true,    // ← you can safely remove these two
  // useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => {
    console.error("Failed to connect to MongoDB:", err.message || err);
    process.exit(1);
  });

app.use("/api", eventRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));