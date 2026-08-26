const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // 👈 1. Import upload middleware

const authenticate = typeof authMiddleware === "function" 
    ? authMiddleware 
    : (authMiddleware.authenticateToken || authMiddleware.authenticate);

router.get("/profile", authenticate, userController.getUserProfile);

// 👈 2. Add upload.single("profile_picture") into the route chain
router.put("/profile", authenticate, upload.single("profile_picture"), userController.updateUserProfile);

if (userController.changePassword) {
    router.put("/change-password", authenticate, userController.changePassword);
}

module.exports = router;