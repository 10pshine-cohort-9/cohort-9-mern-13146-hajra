require("dotenv").config();

const app = require("./app");
const logger = require("./src/logger/logger");
const pool = require("./src/config/db");

function isValidPort(port) {
    return Number.isInteger(port) && port >= 1 && port <= 65535;
}

const portValue = process.env.PORT || 5000;
const PORT = Number(portValue);

if (!isValidPort(PORT)) {
    logger.error("Invalid PORT configuration");
    process.exit(1);
}

async function startServer() {
    try {
        const connection = await pool.getConnection();
        logger.info("Database connected successfully");
        connection.release();
       const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
server.on("error", (error) => {
    logger.error(error, "Server startup failed");
    process.exit(1);
});
        return server;
    } catch (error) {
        logger.error(error, "Database connection failed");
        process.exit(1);
    }
}

/* istanbul ignore next -- exercised only when server.js is run directly (`node server.js`), not when required in tests */
if (require.main === module) {
    startServer();
}

module.exports = { startServer, isValidPort, PORT };