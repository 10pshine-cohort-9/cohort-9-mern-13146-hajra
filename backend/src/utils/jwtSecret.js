function getJwtSecret() {
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === "test" ? "testsecret" : null);
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not defined.");
    }
    return secret;
}

module.exports = getJwtSecret;