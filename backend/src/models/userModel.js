const pool = require("../config/db");
const withErrorLogging = require("../utils/withErrorLogging");

async function createUser({ name, email, password }) {
    return withErrorLogging("createUser", async () => {
        const [result] = await pool.execute(
            `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
            [name, email, password]
        );
        return result.insertId;
    });
}

async function findUserByEmail(email) {
    return withErrorLogging("findUserByEmail", async () => {
        const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
        return rows[0] || null;
    });
}

async function findUserById(userId) {
    return withErrorLogging(`findUserById for userId ${userId}`, async () => {
        const [rows] = await pool.execute(
            `SELECT * FROM users WHERE id = ?`,
            [userId]
        );
        return rows[0] || null;
    });
}

async function updateUserProfile(userId, { name, profile_picture, password }) {
    return withErrorLogging("updateUserProfile", async () => {
        const [result] = await pool.execute(
            `UPDATE users 
             SET name = COALESCE(?, name), 
                 profile_picture = COALESCE(?, profile_picture),
                 password = COALESCE(?, password)
             WHERE id = ?`,
            [
                name !== undefined ? name : null, 
                profile_picture !== undefined ? profile_picture : null, 
                password !== undefined ? password : null, 
                userId
            ]
        );
        return result.affectedRows;
    });
}

async function updateUserPassword(userId, hashedPassword) {
    return withErrorLogging(`updateUserPassword for userId ${userId}`, async () => {
        const [result] = await pool.execute(
            `UPDATE users SET password = ? WHERE id = ?`,
            [hashedPassword, userId]
        );
        return result.affectedRows;
    });
}

async function deleteUser(userId) {
    return withErrorLogging(`deleteUser for userId ${userId}`, async () => {
        const [result] = await pool.execute(
            `DELETE FROM users WHERE id = ?`,
            [userId]
        );
        return result.affectedRows;
    });
}

async function updateUser(userId, data) {
    return await updateUserProfile(userId, data);
}

async function updatePassword(userId, hashedPassword) {
    return await updateUserPassword(userId, hashedPassword);
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserProfile,
    updateUserPassword,
    deleteUser,
    updateUser,
    updatePassword
};