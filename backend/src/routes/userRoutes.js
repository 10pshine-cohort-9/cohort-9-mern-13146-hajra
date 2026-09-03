const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const { upload, validateImageContent } = require("../middleware/uploadMiddleware");

let authenticate;
/* istanbul ignore else -- authMiddleware always exports a function directly in this codebase; object-shape fallback is unreachable defensive code */
if (typeof authMiddleware === "function") {
    authenticate = authMiddleware;
} else {
    authenticate = authMiddleware.authenticateToken || authMiddleware.authenticate;
}
router.get("/profile", authenticate, userController.getUserProfile);

router.put("/profile", authenticate, upload.single("profile_picture"), userController.updateUserProfile);


/* istanbul ignore else -- userController always exports changePassword in this codebase; guard is unreachable defensive code */
if (userController.changePassword) {
    router.put("/change-password", authenticate, userController.changePassword);
}

module.exports = router;