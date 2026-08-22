const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const logger = require("../logger/logger");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            name.trim() === "" ||
            name.length > 255 ||
            typeof email !== "string" ||
            !EMAIL_REGEX.test(email.trim()) ||
            typeof password !== "string" ||
            password.length < 6 ||
            password.length > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, valid email, and password (6-72 chars) are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await userModel.findUserByEmail(normalizedEmail);

        if (existingUser) {
            logger.warn("Registration attempt with an already registered email");
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await userModel.createUser({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            profile_picture: null
        });

        const token = jwt.sign(
            { id: userId, email: normalizedEmail },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: userId,
                name: name.trim(),
                email: normalizedEmail,
                token
            }
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            !EMAIL_REGEX.test(email.trim()) ||
            typeof password !== "string" ||
            password.length > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await userModel.findUserByEmail(normalizedEmail);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};