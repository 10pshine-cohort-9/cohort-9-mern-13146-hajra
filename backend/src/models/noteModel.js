const pool = require("../config/db");

async function createNote(noteData) {
    const { user_id, title, content } = noteData;

    const [result] = await pool.execute(
        `INSERT INTO notes
        (user_id, title, content)
        VALUES (?, ?, ?)`,
        [user_id, title, content]
    );

    return result.insertId;
}

async function getNotesByUser(userId) {
    const [rows] = await pool.execute(
        `SELECT id, user_id, title, content, is_pinned, is_archived,
                created_at, updated_at
         FROM notes
         WHERE user_id = ?
         ORDER BY updated_at DESC`,
        [userId]
    );

    return rows;
}

async function getNoteById(noteId, userId) {
    const [rows] = await pool.execute(
        `SELECT id, user_id, title, content, is_pinned, is_archived,
                created_at, updated_at
         FROM notes
         WHERE id = ? AND user_id = ?`,
        [noteId, userId]
    );

    return rows[0] || null;
}

async function updateNote(noteId, userId, noteData) {
    const { title, content } = noteData;

    const [result] = await pool.execute(
        `UPDATE notes
         SET title = ?, content = ?
         WHERE id = ? AND user_id = ?`,
        [title, content, noteId, userId]
    );

    return result.affectedRows;
}

async function deleteNote(noteId, userId) {
    const [result] = await pool.execute(
        `DELETE FROM notes
         WHERE id = ? AND user_id = ?`,
        [noteId, userId]
    );

    return result.affectedRows;
}

async function togglePin(noteId, userId, isPinned) {
    const [result] = await pool.execute(
        `UPDATE notes
         SET is_pinned = ?
         WHERE id = ? AND user_id = ?`,
        [isPinned, noteId, userId]
    );

    return result.affectedRows;
}

async function toggleArchive(noteId, userId, isArchived) {
    const [result] = await pool.execute(
        `UPDATE notes
         SET is_archived = ?
         WHERE id = ? AND user_id = ?`,
        [isArchived, noteId, userId]
    );

    return result.affectedRows;
}

async function getPinnedNotes(userId) {
    const [rows] = await pool.execute(
        `SELECT id, user_id, title, content, is_pinned, is_archived,
                created_at, updated_at
         FROM notes
         WHERE user_id = ? AND is_pinned = TRUE
         ORDER BY updated_at DESC`,
        [userId]
    );

    return rows;
}

async function getArchivedNotes(userId) {
    const [rows] = await pool.execute(
        `SELECT id, user_id, title, content, is_pinned, is_archived,
                created_at, updated_at
         FROM notes
         WHERE user_id = ? AND is_archived = TRUE
         ORDER BY updated_at DESC`,
        [userId]
    );

    return rows;
}

module.exports = {
    createNote,
    getNotesByUser,
    getNoteById,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    getPinnedNotes,
    getArchivedNotes
};