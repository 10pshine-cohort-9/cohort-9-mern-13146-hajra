const express = require("express");
const cors = require("cors");
const pinoHttp = require("pino-http");
const logger = require("./src/logger/logger");

const errorMiddleware = require("./src/middleware/errorMiddleware");
const authRoutes = require("./src/routes/authRoutes");
const noteRoutes = require("./src/routes/noteRoutes");

const app = express();

// Core Middleware - Restricted CORS options
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",") 
  : ["http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(pinoHttp({ logger }));

// Base & Health Routes
app.get("/", (req, res) => {
    res.send("Notes API is running");
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy"
    });
});

// Test-only Error Endpoint
if (process.env.NODE_ENV === "test") {
    app.get("/__test__/error", (req, res, next) => {
        next(new Error("Test application error"));
    });
}

// API Feature Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// 404 Route Not Found Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;