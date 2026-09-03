const express = require("express");
const path = require("path");
const cors = require("cors");
const pinoHttp = require("pino-http");
const logger = require("./src/logger/logger");
const authRoutes = require("./src/routes/authRoutes");
const noteRoutes = require("./src/routes/noteRoutes");
const userRoutes = require("./src/routes/userRoutes");
const errorMiddleware = require("./src/middleware/errorMiddleware");

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
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
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

app.use(pinoHttp({ logger }));


app.get("/", (req, res) => {
    res.send("Notes API is running");
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy"
    });
});

/* istanbul ignore next -- test-only routes, false branch is production and not exercised in test suite */
if (process.env.NODE_ENV === "test") {
    app.get("/__test__/error-after-headers", (req, res, next) => {
        res.flushHeaders();
        next(new Error("Test error after headers sent"));
    });

    app.get("/__test__/error", (req, res, next) => {
        next(new Error("Simulated unhandled error"));
    });
}

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

app.use(errorMiddleware);

module.exports = app;