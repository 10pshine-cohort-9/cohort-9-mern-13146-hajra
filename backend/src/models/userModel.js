const pool = require("../config/db");
const logger = require("../logger/logger");

async function createUser({ name, email, password }) {
    try {
        const [result] = await pool.execute(
            `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
            [name, email, password]
        );
        return result.insertId;
    } catch (error) {
        logger.error(`Error in createUser: ${error.message}`);
        throw error;
    }
}

async function findUserByEmail(email) {
    try {
        const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
        return rows[0] || null;
    } catch (error) {
        logger.error(`Error in findUserByEmail: ${error.message}`);
        throw error;
    }
}

async function findUserById(userId) {
    try {
        const [rows] = await pool.execute(
            `SELECT * FROM users WHERE id = ?`,
            [userId]
        );
        return rows[0] || null;
    } catch (error) {
        logger.error(`Error in findUserById for userId ${userId}: ${error.message}`);
        throw error;
    }
}

async function updateUserProfile(userId, { name, profile_picture }) {
    try {
        const [result] = await pool.execute(
            `UPDATE users 
             SET name = COALESCE(?, name), 
                 profile_picture = COALESCE(?, profile_picture) 
             WHERE id = ?`,
            [name !== undefined ? name : null, profile_picture !== undefined ? profile_picture : null, userId]
        );
        return result.affectedRows;
    } catch (error) {
        logger.error(`Error in updateUserProfile: ${error.message}`);
        throw error;
    }
}

async function updateUserPassword(userId, hashedPassword) {
    try {
        const [result] = await pool.execute(
            `UPDATE users SET password = ? WHERE id = ?`,
            [hashedPassword, userId]
        );
        return result.affectedRows;
    } catch (error) {
        logger.error(`Error in updateUserPassword for userId ${userId}: ${error.message}`);
        throw error;
    }
}

async function deleteUser(userId) {
    try {
        const [result] = await pool.execute(
            `DELETE FROM users WHERE id = ?`,
            [userId]
        );
        return result.affectedRows;
    } catch (error) {
        logger.error(`Error in deleteUser for userId ${userId}: ${error.message}`);
        throw error;
    }
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