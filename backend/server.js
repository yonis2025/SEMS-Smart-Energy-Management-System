
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const energyRoutes = require("./routes/energyRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Home API
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SEMS backend is running.",
  });
});

// Health API
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SEMS API is healthy.",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Energy management routes
app.use("/api/energy", energyRoutes);

// Handle unknown API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Start the backend
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, "127.0.0.1", () => {
      console.log("--------------------------------------");
      console.log("SEMS - Smart Energy Management System");
      console.log(`Backend running at http://127.0.0.1:${PORT}`);
      console.log("Registration API: /api/auth/register");
      console.log("Login API: /api/auth/login");
      console.log("Session API: /api/auth/me");
      console.log("Logout API: /api/auth/logout");
      console.log("Energy API: /api/energy");
      console.log("--------------------------------------");
    });
  } catch (error) {
    console.error("SEMS startup error:", error.message);
    process.exit(1);
  }
}

startServer();
