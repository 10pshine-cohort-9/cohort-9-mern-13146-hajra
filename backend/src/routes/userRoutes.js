const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const { upload, validateImageContent } = require("../middleware/uploadMiddleware");
const authenticate = typeof authMiddleware === "function" 
    ? authMiddleware 
    : (authMiddleware.authenticateToken || authMiddleware.authenticate);

router.get("/profile", authenticate, userController.getUserProfile);

router.put("/profile", authenticate, upload.single("profile_picture"), userController.updateUserProfile);

if (userController.changePassword) {
    router.put("/change-password", authenticate, userController.changePassword);
}

module.exports = router;