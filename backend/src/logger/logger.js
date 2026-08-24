const pino = require("pino");

const logger = pino({
    level: "info",
    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "res.headers['set-cookie']"
        ],
        censor: "[REDACTED]"
    }
});

module.exports = logger;