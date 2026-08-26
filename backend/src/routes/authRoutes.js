const express = require("express");
const rateLimit = require("express-rate-limit");
const { register, login ,getProfile , updateProfile } = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware"); 
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    skip: () => process.env.NODE_ENV === "test",
    message: {
        success: false,
        message: "Too many requests, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/profile", authenticateToken, getProfile);

router.put("/profile", 
 
  authenticateToken, 
  upload.single("profile_picture"), 
  updateProfile
);

module.exports = router;