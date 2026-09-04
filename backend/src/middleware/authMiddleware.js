const jwt = require("jsonwebtoken");
const getJwtSecret = require("../utils/jwtSecret");

function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
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

        const secret = getJwtSecret();
        const decoded = jwt.verify(token, secret);
        const userId = decoded.id || decoded.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
        }

        req.user = {
            id: userId
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