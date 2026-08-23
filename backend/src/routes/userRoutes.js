const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const authenticate = typeof authMiddleware === "function" 
    ? authMiddleware 
    : (authMiddleware.authenticateToken || authMiddleware.authenticate || ((req, res, next) => next()));

const getProfileHandler = userController.getUserProfile || userController.getProfile;
const updateProfileHandler = userController.updateProfile || userController.updateUserProfile;
const changePasswordHandler = userController.changePassword;
router.get("/profile", authenticate, getProfileHandler);
router.put("/profile", authenticate, updateProfileHandler);

if (changePasswordHandler) {
    router.put("/change-password", authenticate, changePasswordHandler);
}

module.exports = router;