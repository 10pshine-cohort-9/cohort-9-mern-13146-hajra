const logger = require("../logger/logger");

async function withErrorLogging(label, fn) {
    try {
        return await fn();
    } catch (error) {
        logger.error(`Error in ${label}: ${error.message}`);
        throw error;
    }
}

module.exports = withErrorLogging;