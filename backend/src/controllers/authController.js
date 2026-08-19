const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userModel = require("../models/userModel");
const logger = require("../logger/logger");




async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            name.trim() === "" ||
            typeof email !== "string" ||
            email.trim() === "" ||
            typeof password !== "string" ||
            password.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await userModel.findUserByEmail(normalizedEmail);

        if (existingUser) {
            logger.warn(
    { },
    "Registration attempt with an already registered email"
);
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

        logger.info(
    {
        userId,
    },
    "User registered successfully"
);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: userId,
                name: name.trim(),
                email: normalizedEmail
            }
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            email.trim() === "" ||
            typeof password !== "string" ||
            password.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await userModel.findUserByEmail(normalizedEmail);

        if (!user) {
            logger.warn(
    {  },
    "Login failed: user not found"
);
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            logger.warn(
    {},
    "Login failed: invalid password"
);
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

        const token = jwt.sign(
            {
                userId: user.id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        logger.info(
    {
        userId: user.id,
    },
    "User logged in successfully"
);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
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

module.exports = {
    register,
    login
};