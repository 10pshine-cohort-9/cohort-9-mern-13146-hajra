const pool = require("../config/db");
const logger = require("../logger/logger");

async function createUser(userData) {
    try {
        const { name, email, password, profile_picture } = userData;

        const [result] = await pool.execute(
            `INSERT INTO users (name, email, password, profile_picture)
             VALUES (?, ?, ?, ?)`,
            [name, email, password, profile_picture || null]
        );

        return result.insertId;
    } catch (error) {
        logger.error(`Error in createUser: ${error.message}`);
        throw error;
    }
}

async function findUserByEmail(email) {
    try {
        const [rows] = await pool.execute(
            `SELECT id, name, email, password, profile_picture, created_at, updated_at
             FROM users
             WHERE email = ?`,
            [email]
        );
        return rows[0] || null;
    } catch (error) {
        logger.error(`Error in findUserByEmail for email ${email}: ${error.message}`);
        throw error;
    }
}

async function getUserById(userId) {
    try {
        const [rows] = await pool.execute(
            `SELECT id, name, email, profile_picture, created_at, updated_at
             FROM users
             WHERE id = ?`,
            [userId]
        );
        return rows[0] || null;
    } catch (error) {
        logger.error(`Error in getUserById for userId ${userId}: ${error.message}`);
        throw error;
    }
}

async function getUserWithPasswordById(userId) {
    try {
        const [rows] = await pool.execute(
            `SELECT id, name, email, password, profile_picture, created_at, updated_at
             FROM users
             WHERE id = ?`,
            [userId]
        );
        return rows[0] || null;
    } catch (error) {
        logger.error(`Error in getUserWithPasswordById for userId ${userId}: ${error.message}`);
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
        logger.error(`Error in updateUserProfile for userId ${userId}: ${error.message}`);
        throw error;
    }
}

async function updateUserPassword(userId, newHashedPassword) {
    try {
        const [result] = await pool.execute(
            `UPDATE users
             SET password = ?
             WHERE id = ?`,
            [newHashedPassword, userId]
        );
        return result.affectedRows;
    } catch (error) {
        logger.error(`Error in updateUserPassword for userId ${userId}: ${error.message}`);
        throw error;
    }
}

async function deleteUser(id) {
    try {
        const [result] = await pool.execute(
            `DELETE FROM users WHERE id = ?`,
            [id]
        );
        return result.affectedRows;
    } catch (error) {
        logger.error(`Error in deleteUser for id ${id}: ${error.message}`);
        throw error;
    }
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById: getUserWithPasswordById,
    updateUser: updateUserProfile,
    updatePassword: updateUserPassword,
    deleteUser,
    getUserById,
    getUserWithPasswordById,
    updateUserProfile,
    updateUserPassword
};