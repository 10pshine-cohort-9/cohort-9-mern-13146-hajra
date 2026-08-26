const logger = require("../logger/logger");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const pool = require("../config/db");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getJwtSecret() {
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === "test" ? "testsecret" : null);
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not defined.");
    }
    return secret;
}

async function register(req, res, next) {
    try {
        const body = req.body || {};
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        // FIX 1: Enforce minimum length and string type for password
        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        const emailStr = String(email).trim().toLowerCase();

        if (!EMAIL_REGEX.test(emailStr)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        const existingUser = await userModel.findUserByEmail(emailStr);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(String(password), 10);
        let userId;

        // FIX 2: Catch ER_DUP_ENTRY on race conditions and return HTTP 409
        try {
            userId = await userModel.createUser({
                name: String(name).trim(),
                email: emailStr,
                password: hashedPassword
            });
        } catch (dbError) {
            if (dbError.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    success: false,
                    message: "User with this email already exists"
                });
            }
            throw dbError;
        }

        const token = jwt.sign({ id: userId }, getJwtSecret(), { expiresIn: "24h" });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: userId,
                name: String(name).trim(),
                email: emailStr,
                token,
                user: {
                    id: userId,
                    name: String(name).trim(),
                    email: emailStr
                }
            }
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const body = req.body || {};

        let rawEmail = body.email || body.username || body.emailOrUsername;
        if (typeof rawEmail === "object" && rawEmail !== null) {
            rawEmail = rawEmail.email || rawEmail.user?.email;
        }

        const rawPassword = body.password || body.pass;

        if (!rawEmail || !rawPassword) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const cleanEmail = String(rawEmail).trim().toLowerCase();
        const cleanPassword = String(rawPassword);

        let user = await userModel.findUserByEmail(cleanEmail);
        if (!user) {
            user = await userModel.findUserByEmail(String(rawEmail).trim());
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isPasswordValid = await bcrypt.compare(cleanPassword, user.password || "");

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign({ id: user.id }, getJwtSecret(), { expiresIn: "24h" });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                profile_picture: user.profile_picture,
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    profile_picture: user.profile_picture
                }
            }
        });
    } catch (error) {
        next(error);
    }
}

async function getProfile(req, res, next) {
    try {
        const userId = req.user.id;
        const user = await userModel.findUserById(userId); 

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                profile_picture: user.profile_picture // ✅ Added this line so it syncs properly
            }
        });
    } catch (error) {
        next(error);
    }
}


async function updateProfile(req, res, next) {
    try {
        const userId = req.user.id;
        const { name, password } = req.body;

        const currentUser = await userModel.findUserById(userId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const newName = name !== undefined && name.trim() !== "" ? String(name).trim() : currentUser.name;
        
        const profilePicturePath = req.file ? `/uploads/${req.file.filename}` : currentUser.profile_picture;

        await userModel.updateUserProfile(userId, {
            name: newName,
            profile_picture: profilePicturePath
        });

        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(String(password), 10);
            await userModel.updatePassword(userId, hashedPassword);
        }

        const updatedUser = await userModel.findUserById(userId);

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                profile_picture: updatedUser.profile_picture 
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};