require("dotenv").config();
const http = require("http");
const express = require("express");
const { Server: SocketIO } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const matchRoutes = require("./routes/matchRoutes");
const playerRoutes = require("./routes/playerRoutes");
const statsRoutes = require("./routes/statsRoutes");
const publicRoutes = require("./routes/publicRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve test page for Socket.io: open http://localhost:5000/test-socket.html in browser
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/matches", matchRoutes);
app.get("/", (req, res) => {
  res.send("GoSport Backend Running 🚀");
});
app.use("/api/players", playerRoutes);
app.use("/api/stats", statsRoutes);

// MongoDB Connection (uses MONGODB_URI from .env, or default for local dev)
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/gosport";
mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// HTTP server (needed so we can attach Socket.io to the same port)
const server = http.createServer(app);

// Socket.io for real-time updates (spectators see score changes live)
const io = new SocketIO(server, {
  cors: { origin: "*" },
});
app.set("io", io);

// Optional: log when a client connects (for debugging)
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server (PORT from .env or 5000)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});