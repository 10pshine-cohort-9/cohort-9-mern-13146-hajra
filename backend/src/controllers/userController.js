const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const logger = require("../logger/logger");

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,72}$/;

exports.getProfile = async (req, res, next) => {
    try {
        const user = await userModel.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { name, profile_picture } = req.body;

        if (name !== undefined && (typeof name !== "string" || name.trim() === "" || name.length > 255)) {
            return res.status(400).json({
                success: false,
                message: "Name must be a valid non-empty string under 255 characters"
            });
        }

        const affectedRows = await userModel.updateUserProfile(req.user.id, {
            name: name ? name.trim() : undefined,
            profile_picture: profile_picture !== undefined ? profile_picture : undefined
        });

        if (!affectedRows) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const updatedUser = await userModel.getUserById(req.user.id);
        
        logger.info({ userId: req.user.id }, "User profile updated successfully");

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        const user = await userModel.getUserWithPasswordById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect current password" });
        }

        if (typeof newPassword !== "string" || !PASSWORD_REGEX.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "New password must be 8-72 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character"
            });
        }

        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        await userModel.updateUserPassword(req.user.id, newHashedPassword);

        logger.info({ userId: req.user.id }, "User password changed successfully");

        return res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        next(error);
    }
};