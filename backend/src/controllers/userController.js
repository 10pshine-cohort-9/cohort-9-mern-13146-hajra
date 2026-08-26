const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");

async function getUserProfile(req, res, next) {
    try {
        const userId = req.user?.id || req.user?.user_id;
        const getUser = userModel.findUserById || userModel.getUserById;
        const user = await getUser(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const { password, ...userWithoutPassword } = user;
        return res.status(200).json({
            success: true,
            data: userWithoutPassword
        });
    } catch (error) {
        next(error);
    }
}

async function updateUserProfile(req, res, next) {
    try {
        const userId = req.user?.id || req.user?.user_id;
        const { name } = req.body || {};

        if (name !== undefined) {
            if (typeof name !== "string" || name.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Name must be a non-empty string"
                });
            }
        }

        // ✅ Extract the file path properly from multer's req.file
        const profilePicturePath = req.file ? `/uploads/${req.file.filename}` : undefined;

        const updatePayload = {
            name: name !== undefined ? name.trim() : undefined,
            profile_picture: profilePicturePath
        };

        await userModel.updateUserProfile(userId, updatePayload);

        const getUser = userModel.findUserById || userModel.getUserById;
        const updatedUser = await getUser(userId);

        const { password, ...userWithoutPassword } = updatedUser || {};

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: userWithoutPassword
        });
    } catch (error) {
        next(error);
    }
}

async function changePassword(req, res, next) {
    try {
        const userId = req.user?.id || req.user?.user_id;
        const { currentPassword, oldPassword, newPassword } = req.body || {};
        const inputCurrentPassword = currentPassword || oldPassword;

        if (!inputCurrentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Both currentPassword and newPassword are required"
            });
        }

        if (typeof newPassword !== "string" || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
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

        const isMatch = await bcrypt.compare(String(inputCurrentPassword), user.password || "");
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect current password"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatePass = userModel.updateUserPassword || userModel.updatePassword;
        await updatePass(userId, hashedPassword);

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUserProfile,
    getProfile: getUserProfile,
    updateUserProfile,
    updateProfile: updateUserProfile,
    changePassword
};