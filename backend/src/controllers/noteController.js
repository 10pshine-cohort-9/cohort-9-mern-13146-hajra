const noteModel = require("../models/noteModel");
const logger = require("../logger/logger");


async function createNote(req, res, next) {
    try {
        const { title, content } = req.body;

        if (
            typeof title !== "string" ||
            title.trim() === "" ||
            typeof content !== "string" ||
            content.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        const noteId = await noteModel.createNote({
            user_id: req.user.id,
            title: title.trim(),
            content: content.trim()
        });
        logger.info(
    {
        userId: req.user.id,
        noteId
    },
    "Note created successfully"
);

        return res.status(201).json({
            success: true,
            message: "Note created successfully",
            data: {
                id: noteId
            }
        });
    } catch (error) {
        next(error);
    }
}

async function getNotes(req, res, next) {
    try {
        const notes = await noteModel.getNotesByUser(req.user.id);

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
        const noteId = Number(req.params.id);

        if (!Number.isInteger(noteId) || noteId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid note ID"
            });
        }

        const note = await noteModel.getNoteById(
            noteId,
            req.user.id
        );

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }
        logger.info(
    {
        userId: req.user.id,
        noteId
    },
    "Note retrieved successfully"
);
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
        const noteId = Number(req.params.id);
        const { title, content } = req.body;

        if (!Number.isInteger(noteId) || noteId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid note ID"
            });
        }

        if (
            typeof title !== "string" ||
            title.trim() === "" ||
            typeof content !== "string" ||
            content.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        const affectedRows = await noteModel.updateNote(
            noteId,
            req.user.id,
            {
                title: title.trim(),
                content: content.trim()
            }
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        logger.info(
    {
        userId: req.user.id,
        noteId
    },
    "Note updated successfully"
);

        return res.status(200).json({
            success: true,
            message: "Note updated successfully"
        });
    } catch (error) {
        next(error);
    }
}

async function deleteNote(req, res, next) {
    try {
        const noteId = Number(req.params.id);

        if (!Number.isInteger(noteId) || noteId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid note ID"
            });
        }

        const affectedRows = await noteModel.deleteNote(
            noteId,
            req.user.id
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        logger.info(
    {
        userId: req.user.id,
        noteId
    },
    "Note deleted successfully"
);
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
        const noteId = Number(req.params.id);
        const { isPinned } = req.body;

        if (!Number.isInteger(noteId) || noteId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid note ID"
            });
        }

        if (typeof isPinned !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isPinned must be a boolean"
            });
        }

        const affectedRows = await noteModel.togglePin(
            noteId,
            req.user.id,
            isPinned
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

            logger.info(
    {
        userId: req.user.id,
        noteId,
        isPinned
    },
    isPinned
        ? "Note pinned successfully"
        : "Note unpinned successfully"
);
        return res.status(200).json({
            success: true,
            message: isPinned
                ? "Note pinned successfully"
                : "Note unpinned successfully"
        });
    } catch (error) {
        next(error);
    }
}

async function toggleArchive(req, res, next) {
    try {
        const noteId = Number(req.params.id);
        const { isArchived } = req.body;

        if (!Number.isInteger(noteId) || noteId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid note ID"
            });
        }

        if (typeof isArchived !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isArchived must be a boolean"
            });
        }

        const affectedRows = await noteModel.toggleArchive(
            noteId,
            req.user.id,
            isArchived
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        logger.info(
    {
        userId: req.user.id,
        noteId,
        isArchived
    },
    isArchived
        ? "Note archived successfully"
        : "Note unarchived successfully"
);

        return res.status(200).json({
            success: true,
            message: isArchived
                ? "Note archived successfully"
                : "Note unarchived successfully"
        });
    } catch (error) {
        next(error);
    }
}

async function getPinnedNotes(req, res, next) {
    try {
        const notes = await noteModel.getPinnedNotes(req.user.id);

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
        const notes = await noteModel.getArchivedNotes(req.user.id);

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
    getArchivedNotes
};