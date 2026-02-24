const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const matchRoutes = require("./routes/matchRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Test route
app.use("/api/auth", authRoutes);
app.use("/api/matches", matchRoutes);
app.get("/", (req, res) => {
  res.send("GoSport Backend Running 🚀");
});

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/gosport")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});