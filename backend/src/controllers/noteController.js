const noteModel = require("../models/noteModel");

async function createNote(req, res, next) {
    try {
        const { title, content } = req.body || {};

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            });
        }

        const userId = req.user?.id || req.user?.user_id;

        // noteModel requires both title and content to be non-empty strings
        const noteData = {
            user_id: userId,
            title: title.trim(),
            content: (typeof content === "string" && content.trim() !== "") ? content.trim() : " "
        };

        const insertId = await noteModel.createNote(noteData);
        const createdNote = await noteModel.getNoteById(insertId, userId);

        return res.status(201).json({
            success: true,
            message: "Note created successfully",
            data: createdNote || { id: insertId, ...noteData }
        });
    } catch (error) {
        next(error);
    }
}

async function getNotes(req, res, next) {
    try {
        const userId = req.user?.id || req.user?.user_id;
        const notes = await noteModel.getNotesByUser(userId);

        return res.status(200).json({
            success: true,
            data: notes
        });
    } catch (error) {
        next(error);
    }
}

async function getNoteById(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.user?.user_id;

        const note = await noteModel.getNoteById(id, userId);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: note
        });
    } catch (error) {
        next(error);
    }
}

async function updateNote(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.user?.user_id;

        const existingNote = await noteModel.getNoteById(id, userId);
        if (!existingNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        const { title, content, is_pinned, is_archived } = req.body || {};

        // Validate is_pinned if provided
        let normalizedPinned = undefined;
        if (is_pinned !== undefined) {
            if (typeof is_pinned === "boolean") {
                normalizedPinned = is_pinned ? 1 : 0;
            } else if (is_pinned === 0 || is_pinned === 1) {
                normalizedPinned = is_pinned;
            } else {
                return res.status(400).json({
                    success: false,
                    message: "is_pinned must be a boolean or 0/1"
                });
            }
        }

        // Validate is_archived if provided
        let normalizedArchived = undefined;
        if (is_archived !== undefined) {
            if (typeof is_archived === "boolean") {
                normalizedArchived = is_archived ? 1 : 0;
            } else if (is_archived === 0 || is_archived === 1) {
                normalizedArchived = is_archived;
            } else {
                return res.status(400).json({
                    success: false,
                    message: "is_archived must be a boolean or 0/1"
                });
            }
        }

        const updateData = {
            title: title !== undefined ? title : existingNote.title,
            content: content !== undefined ? content : existingNote.content,
            is_pinned: normalizedPinned !== undefined ? normalizedPinned : existingNote.is_pinned,
            is_archived: normalizedArchived !== undefined ? normalizedArchived : existingNote.is_archived
        };

        await noteModel.updateNote(id, userId, updateData);
        const updatedNote = await noteModel.getNoteById(id, userId);

        return res.status(200).json({
            success: true,
            message: "Note updated successfully",
            data: updatedNote || { id: Number(id), user_id: userId, ...updateData }
        });
    } catch (error) {
        next(error);
    }
}

async function deleteNote(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.user?.user_id;

        const existingNote = await noteModel.getNoteById(id, userId);
        if (!existingNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        await noteModel.deleteNote(id, userId);

        return res.status(200).json({
            success: true,
            message: "Note deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

async function togglePin(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.user?.user_id;
        const { is_pinned } = req.body || {};

        const affectedRows = await noteModel.togglePin(id, userId, is_pinned);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }

        const updatedNote = await noteModel.getNoteById(id, userId);
        return res.status(200).json({ success: true, data: updatedNote });
    } catch (error) {
        next(error);
    }
}

async function toggleArchive(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.user?.user_id;
        const { is_archived } = req.body || {};

        const affectedRows = await noteModel.toggleArchive(id, userId, is_archived);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }

        const updatedNote = await noteModel.getNoteById(id, userId);
        return res.status(200).json({ success: true, data: updatedNote });
    } catch (error) {
        next(error);
    }
}

async function getPinnedNotes(req, res, next) {
    try {
        const userId = req.user?.id || req.user?.user_id;
        const notes = await noteModel.getPinnedNotes(userId);

        return res.status(200).json({
            success: true,
            data: notes
        });
    } catch (error) {
        next(error);
    }
}

async function getArchivedNotes(req, res, next) {
    try {
        const userId = req.user?.id || req.user?.user_id;
        const notes = await noteModel.getArchivedNotes(userId);

        return res.status(200).json({
            success: true,
            data: notes
        });
    } catch (error) {
        next(error);
    }
}

async function searchNotes(req, res, next) {
    try {
        const userId = req.user?.id || req.user?.user_id;
        const { q, search, is_pinned, pinned, is_archived, archived, sort } = req.query || {};

        // Map request queries directly to noteModel.searchNotes parameters
        const searchOptions = {
            q: q || search || "",
            pinned: pinned !== undefined ? pinned : is_pinned,
            archived: archived !== undefined ? archived : is_archived,
            sort
        };

        const notes = await noteModel.searchNotes(userId, searchOptions);

        return res.status(200).json({
            success: true,
            data: notes
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    getPinnedNotes,
    getArchivedNotes,
    searchNotes
};