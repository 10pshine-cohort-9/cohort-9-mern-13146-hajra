const logger = require("../logger/logger");

function errorMiddleware(err, req, res, next) {
    logger.error(err.stack || err.message);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message
    });
}

module.exports = errorMiddleware;