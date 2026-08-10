require("dotenv").config();

const app = require("./app");
const logger = require("./src/logger/logger");
const pool = require("./src/config/db");

const portValue = process.env.PORT || 5000;
const PORT = Number(portValue);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
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

    } catch (error) {
        logger.error(error, "Database connection failed");
        process.exit(1);
    }
}

startServer();