require("dotenv").config();

const app = require("./app");
const logger = require("./src/logger/logger");


const portValue = process.env.PORT || 5000;

const PORT = Number(portValue);


if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    logger.error("Invalid PORT configuration");
    process.exit(1);
}


app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});