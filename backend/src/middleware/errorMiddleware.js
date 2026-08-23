const logger = require("../logger/logger");

function errorMiddleware(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    if (logger && typeof logger.error === "function") {
        logger.error(err.stack || err.message || err);
    }

    const statusCode = err.statusCode || err.status || 500;
    
    // Hide raw database or internal exception details on 500 errors
    const message = statusCode >= 500 
        ? "Internal Server Error" 
        : (err.message || "Something went wrong");

    return res.status(statusCode).json({
        success: false,
        message
    });
}

module.exports = errorMiddleware;