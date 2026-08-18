const logger = require("../logger/logger");

function errorMiddleware(error, req, res, next) {
    logger.error(
        {
            err: error,
            method: req.method,
            url: req.originalUrl
        },
        "Unhandled application error"
    );

    if (res.headersSent) {
        return next(error);
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}

module.exports = errorMiddleware;