const noteModel = require("../models/noteModel");

// Helper to normalize and validate boolean/numeric flag inputs (0, 1, true, false, "true", "false")
function parseBooleanFlag(val) {
    if (typeof val === "boolean") return val ? 1 : 0;
    if (val === 1 || val === "1" || val === "true") return 1;
    if (val === 0 || val === "0" || val === "false") return 0;
    return null;
}

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

        // FIX 1: Validate content properly without passing whitespace fallback
        const formattedContent = (typeof content === "string") ? content.trim() : "";

        const noteData = {
            user_id: userId,
            title: title.trim(),
            content: formattedContent
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

        // FIX 2: Validate provided title and content strings
        let updatedTitle = existingNote.title;
        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Title cannot be empty"
                });
            }
            updatedTitle = title.trim();
        }

        let updatedContent = existingNote.content;
        if (content !== undefined) {
            if (typeof content !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Content must be a string"
                });
            }
            updatedContent = content.trim();
        }

        let normalizedPinned = undefined;
        if (is_pinned !== undefined) {
            normalizedPinned = parseBooleanFlag(is_pinned);
            if (normalizedPinned === null) {
                return res.status(400).json({
                    success: false,
                    message: "is_pinned must be a boolean or 0/1"
                });
            }
        }

        let normalizedArchived = undefined;
        if (is_archived !== undefined) {
            normalizedArchived = parseBooleanFlag(is_archived);
            if (normalizedArchived === null) {
                return res.status(400).json({
                    success: false,
                    message: "is_archived must be a boolean or 0/1"
                });
            }
        }

        const updateData = {
            title: updatedTitle,
            content: updatedContent,
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

        // FIX 3: Validate and normalize state before calling model
        const normalizedPinned = parseBooleanFlag(is_pinned);
        if (normalizedPinned === null) {
            return res.status(400).json({
                success: false,
                message: "is_pinned must be a boolean or 0/1"
            });
        }

        const affectedRows = await noteModel.togglePin(id, userId, normalizedPinned);
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

        // FIX 3: Validate and normalize state before calling model
        const normalizedArchived = parseBooleanFlag(is_archived);
        if (normalizedArchived === null) {
            return res.status(400).json({
                success: false,
                message: "is_archived must be a boolean or 0/1"
            });
        }

        const affectedRows = await noteModel.toggleArchive(id, userId, normalizedArchived);
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

        const searchOptions = {
            q: q || search || "",
            pinned: pinned !== undefined ? pinned : is_pinned,
            archived: archived !== undefined ? archived : is_archived,
            sort
        };

        const notes = await noteModel.searchNotes(userId, searchOptions);

        // FIX 4: Add count property to search response
        return res.status(200).json({
            success: true,
            count: Array.isArray(notes) ? notes.length : 0,
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