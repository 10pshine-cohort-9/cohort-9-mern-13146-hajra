const pool = require("../config/db");
const logger = require("../logger/logger");

async function createNote(noteData) {
    try {
        if (!noteData || typeof noteData !== "object") {
            throw new Error("Note data is required");
        }

        const { user_id, title, content } = noteData;

        if (!Number.isInteger(user_id) || user_id <= 0) {
            throw new Error("Valid user_id is required");
        }

        if (typeof title !== "string" || title.trim() === "") {
            throw new Error("Title is required");
        }

        if (typeof content !== "string" || content.trim() === "") {
            throw new Error("Content is required");
        }

        const [result] = await pool.execute(
            `INSERT INTO notes
            (user_id, title, content)
            VALUES (?, ?, ?)`,
            [user_id, title, content]
        );

        return result.insertId;
    } catch (error) {
        logger.error(`Error in createNote: ${error.message}`);
        throw error;
    }
}

async function getNotesByUser(userId) {
    try {
        const [rows] = await pool.execute(
            `SELECT id, user_id, title, content, is_pinned, is_archived,
                    created_at, updated_at
             FROM notes
             WHERE user_id = ?
             ORDER BY updated_at DESC`,
            [userId]
        );

        return rows;
    } catch (error) {
        logger.error(`Error in getNotesByUser for userId ${userId}: ${error.message}`);
        throw error;
    }
}

async function getNoteById(noteId, userId) {
    try {
        const [rows] = await pool.execute(
            `SELECT id, user_id, title, content, is_pinned, is_archived,
                    created_at, updated_at
             FROM notes
             WHERE id = ? AND user_id = ?`,
            [noteId, userId]
        );

        return rows[0] || null;
    } catch (error) {
        logger.error(`Error in getNoteById for noteId ${noteId}, userId ${userId}: ${error.message}`);
        throw error;
    }
}

async function updateNote(noteId, userId, noteData) {
    try {
        const { title, content, is_pinned, is_archived } = noteData;

        const [result] = await pool.execute(
            `UPDATE notes
             SET title = COALESCE(?, title),
                 content = COALESCE(?, content),
                 is_pinned = COALESCE(?, is_pinned),
                 is_archived = COALESCE(?, is_archived)
             WHERE id = ? AND user_id = ?`,
            [
                title !== undefined ? title : null,
                content !== undefined ? content : null,
                is_pinned !== undefined ? is_pinned : null,
                is_archived !== undefined ? is_archived : null,
                noteId,
                userId
            ]
        );

        return result.affectedRows;
    } catch (error) {
        logger.error(`Error in updateNote for noteId ${noteId}, userId ${userId}: ${error.message}`);
        throw error;
    }
}

async function deleteNote(noteId, userId) {
    try {
        const [result] = await pool.execute(
            `DELETE FROM notes
             WHERE id = ? AND user_id = ?`,
            [noteId, userId]
        );

        return result.affectedRows;
    } catch (error) {
        logger.error(`Error in deleteNote for noteId ${noteId}, userId ${userId}: ${error.message}`);
        throw error;
    }
}

async function togglePin(noteId, userId, isPinned) {
    try {
        let result;

        if (isPinned !== undefined) {
            [result] = await pool.execute(
                `UPDATE notes
                 SET is_pinned = ?
                 WHERE id = ? AND user_id = ?`,
                [isPinned, noteId, userId]
            );
        } else {
            [result] = await pool.execute(
                `UPDATE notes
                 SET is_pinned = NOT is_pinned
                 WHERE id = ? AND user_id = ?`,
                [noteId, userId]
            );
        }

        return result.affectedRows;
    } catch (error) {
        logger.error(`Error in togglePin for noteId ${noteId}, userId ${userId}: ${error.message}`);
        throw error;
    }
}

async function toggleArchive(noteId, userId, isArchived) {
    try {
        let result;

        if (isArchived !== undefined) {
            [result] = await pool.execute(
                `UPDATE notes
                 SET is_archived = ?
                 WHERE id = ? AND user_id = ?`,
                [isArchived, noteId, userId]
            );
        } else {
            [result] = await pool.execute(
                `UPDATE notes
                 SET is_archived = NOT is_archived
                 WHERE id = ? AND user_id = ?`,
                [isArchived, noteId, userId]
            );
        }

        return result.affectedRows;
    } catch (error) {
        logger.error(`Error in toggleArchive for noteId ${noteId}, userId ${userId}: ${error.message}`);
        throw error;
    }
}

async function getPinnedNotes(userId) {
    try {
        const [rows] = await pool.execute(
            `SELECT id, user_id, title, content, is_pinned, is_archived,
                    created_at, updated_at
             FROM notes
             WHERE user_id = ? AND is_pinned = TRUE
             ORDER BY updated_at DESC`,
            [userId]
        );

        return rows;
    } catch (error) {
        logger.error(`Error in getPinnedNotes for userId ${userId}: ${error.message}`);
        throw error;
    }
}

async function getArchivedNotes(userId) {
    try {
        const [rows] = await pool.execute(
            `SELECT id, user_id, title, content, is_pinned, is_archived,
                    created_at, updated_at
             FROM notes
             WHERE user_id = ? AND is_archived = TRUE
             ORDER BY updated_at DESC`,
            [userId]
        );

        return rows;
    } catch (error) {
        logger.error(`Error in getArchivedNotes for userId ${userId}: ${error.message}`);
        throw error;
    }
}

module.exports = {
    createNote,
    getNotesByUser,
    getNotesByUserId: getNotesByUser,
    getNoteById,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    getPinnedNotes,
    getArchivedNotes
};