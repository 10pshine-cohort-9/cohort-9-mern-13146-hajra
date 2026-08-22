const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");

const {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    getPinnedNotes,
    getArchivedNotes
} = require("../controllers/noteController");

const router = express.Router();

router.use(authenticateToken);

router.post("/", createNote);
router.get("/", getNotes);
router.get("/pinned", getPinnedNotes);
router.get("/archived", getArchivedNotes);
router.get("/:id", getNoteById);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.patch("/:id/pin", togglePin);
router.patch("/:id/archive", toggleArchive);

module.exports = router;