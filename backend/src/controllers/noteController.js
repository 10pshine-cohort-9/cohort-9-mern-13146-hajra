const noteModel = require("../models/noteModel");

exports.createNote = async (req, res, next) => {
    try {
        const { title, content } = req.body;

        if (
            typeof title !== "string" ||
            title.trim() === "" ||
            title.length > 255 ||
            typeof content !== "string" ||
            content.trim() === "" ||
            content.length > 10000
        ) {
            return res.status(400).json({
                success: false,
                message: "Title (max 255 chars) and content (max 10000 chars) are required"
            });
        }

        const noteId = await noteModel.createNote({
            user_id: req.user.id,
            title: title.trim(),
            content: content.trim()
        });

        const newNote = await noteModel.getNoteById(noteId, req.user.id);

        return res.status(201).json({
            success: true,
            message: "Note created successfully",
            data: newNote
        });
    } catch (error) {
        next(error);
    }
};

exports.getNotes = async (req, res, next) => {
    try {
        const notes = await noteModel.getNotesByUser(req.user.id);
        return res.status(200).json({
            success: true,
            data: notes
        });
    } catch (error) {
        next(error);
    }
};

exports.getNoteById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const note = await noteModel.getNoteById(id, req.user.id);

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
};

exports.updateNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, is_pinned, is_archived } = req.body;

        const note = await noteModel.getNoteById(id, req.user.id);
        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        if (
            (title !== undefined && (typeof title !== "string" || title.trim() === "" || title.length > 255)) ||
            (content !== undefined && (typeof content !== "string" || content.trim() === "" || content.length > 10000))
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid title or content input"
            });
        }

        await noteModel.updateNote(id, req.user.id, {
            title: title !== undefined ? title.trim() : note.title,
            content: content !== undefined ? content.trim() : note.content,
            is_pinned: is_pinned !== undefined ? is_pinned : note.is_pinned,
            is_archived: is_archived !== undefined ? is_archived : note.is_archived
        });

        const updatedNote = await noteModel.getNoteById(id, req.user.id);

        return res.status(200).json({
            success: true,
            message: "Note updated successfully",
            data: updatedNote
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const note = await noteModel.getNoteById(id, req.user.id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        await noteModel.deleteNote(id, req.user.id);

        return res.status(200).json({
            success: true,
            message: "Note deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.togglePin = async (req, res, next) => {
    try {
        const { id } = req.params;

        const affectedRows = await noteModel.togglePin(id, req.user.id);
        if (!affectedRows) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        const updatedNote = await noteModel.getNoteById(id, req.user.id);

        return res.status(200).json({
            success: true,
            message: `Note ${updatedNote.is_pinned ? "pinned" : "unpinned"} successfully`,
            data: updatedNote
        });
    } catch (error) {
        next(error);
    }
};

exports.toggleArchive = async (req, res, next) => {
    try {
        const { id } = req.params;

        const affectedRows = await noteModel.toggleArchive(id, req.user.id);
        if (!affectedRows) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        const updatedNote = await noteModel.getNoteById(id, req.user.id);

        return res.status(200).json({
            success: true,
            message: `Note ${updatedNote.is_archived ? "archived" : "unarchived"} successfully`,
            data: updatedNote
        });
    } catch (error) {
        next(error);
    }
};

exports.getPinnedNotes = async (req, res, next) => {
    try {
        const notes = await noteModel.getPinnedNotes(req.user.id);
        return res.status(200).json({ success: true, data: notes });
    } catch (error) {
        next(error);
    }
};

exports.getArchivedNotes = async (req, res, next) => {
    try {
        const notes = await noteModel.getArchivedNotes(req.user.id);
        return res.status(200).json({ success: true, data: notes });
    } catch (error) {
        next(error);
    }
};