const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");

async function getUserProfile(req, res, next) {
    try {
        const userId = req.user.id;
        const user = await userModel.findUserById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        delete user.password;

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
}

async function updateProfile(req, res, next) {
    try {
        const userId = req.user.id;
        const getUser = userModel.findUserById || userModel.getUserById;
        const existingUser = await getUser(userId);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const { name, profile_picture } = req.body;
        await userModel.updateUserProfile(userId, { name, profile_picture });

        const updatedUser = await getUser(userId);
        if (updatedUser && updatedUser.password) {
            delete updatedUser.password;
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
}

async function changePassword(req, res, next) {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword, oldPassword } = req.body || {};

        const existingPassword = currentPassword || oldPassword;

        if (!existingPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        const getUser = userModel.findUserById || userModel.getUserById;
        const user = await getUser(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(String(existingPassword), user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect current password"
            });
        }

        const hashedNewPassword = await bcrypt.hash(String(newPassword), 10);
        await userModel.updateUserPassword(userId, hashedNewPassword);

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUserProfile,
    updateProfile,
    updateUserProfile: updateProfile,
    changePassword
};