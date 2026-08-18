const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required"
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
        }

        req.user = {
            id: decoded.userId
        };

        next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token"
            });
        }

        next(error);
    }
}

module.exports = authenticateToken;