const express = require("express");
const rateLimit = require("express-rate-limit");
const { register, login } = require("../controllers/authController");

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    skip: () => process.env.NODE_ENV === "test", // Bypass during npm test
    message: {
        success: false,
        message: "Too many requests, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

module.exports = router;