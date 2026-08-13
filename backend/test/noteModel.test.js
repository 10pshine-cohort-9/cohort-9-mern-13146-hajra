const { expect } = require("chai");
const assert = require("assert");

const {
    createUser,
    deleteUser
} = require("../src/models/userModel");

const {
    createNote,
    getNotesByUser,
    getNoteById,
     updateNote,
    deleteNote,
      togglePin,
    toggleArchive,
    getPinnedNotes,
    getArchivedNotes
} = require("../src/models/noteModel");

describe("Note Model", () => {

    let testUserId;
    let secondTestUserId;
    let testNoteIds = [];

    it("should create a new note", async () => {
        const testUser = {
            name: "Note Test User",
            email: `note_test_${Date.now()}@example.com`,
            password: "hashed_test_password",
            profile_picture: null
        };

        testUserId = await createUser(testUser);

        const noteData = {
            user_id: testUserId,
            title: "Test Note",
            content: "This is a test note."
        };

        const noteId = await createNote(noteData);
        testNoteIds.push(noteId);

        expect(noteId).to.be.a("number");
        expect(noteId).to.be.greaterThan(0);
    });

    it("should get only notes belonging to a user", async () => {
        const testUser = {
            name: "Notes List User",
            email: `notes_list_${Date.now()}@example.com`,
            password: "hashed_test_password",
            profile_picture: null
        };

        testUserId = await createUser(testUser);

        const firstNoteId = await createNote({
            user_id: testUserId,
            title: "First Test Note",
            content: "First note content."
        });

        const secondNoteId = await createNote({
            user_id: testUserId,
            title: "Second Test Note",
            content: "Second note content."
        });

        testNoteIds.push(firstNoteId, secondNoteId);

        const notes = await getNotesByUser(testUserId);

        expect(notes).to.be.an("array");
        expect(notes).to.have.lengthOf(2);

        expect(notes[0].user_id).to.equal(testUserId);
        expect(notes[1].user_id).to.equal(testUserId);

        expect(notes.map(note => note.id)).to.include(firstNoteId);
        expect(notes.map(note => note.id)).to.include(secondNoteId);
    });


    it("should get a note by ID for the correct user", async () => {
    const testUser = {
        name: "Get Note User",
        email: `get_note_${Date.now()}@example.com`,
        password: "hashed_test_password",
        profile_picture: null
    };

    testUserId = await createUser(testUser);

    const noteId = await createNote({
        user_id: testUserId,
        title: "Get Note Test",
        content: "Testing get note by ID."
    });

    testNoteIds.push(noteId);

    const note = await getNoteById(noteId, testUserId);

    expect(note).to.not.be.null;
    expect(note.id).to.equal(noteId);
    expect(note.user_id).to.equal(testUserId);
    expect(note.title).to.equal("Get Note Test");
    expect(note.content).to.equal("Testing get note by ID.");
});

it("should reject an invalid user_id", async () => {
    await assert.rejects(
        createNote({
            user_id: null,
            title: "Test note",
            content: "Test content"
        }),
        /Valid user_id is required/
    );
});

it("should reject an empty title", async () => {
    await assert.rejects(
        createNote({
            user_id: 1,
            title: "",
            content: "Test content"
        }),
        /Title is required/
    );
});

it("should reject empty content", async () => {
    await assert.rejects(
        createNote({
            user_id: 1,
            title: "Test note",
            content: ""
        }),
        /Content is required/
    );
});

it("should not allow a user to access another user's note", async () => {
    const firstUser = {
        name: "Note Owner",
        email: `owner_${Date.now()}@example.com`,
        password: "hashed_test_password",
        profile_picture: null
    };

    const secondUser = {
        name: "Other User",
        email: `other_${Date.now()}@example.com`,
        password: "hashed_test_password",
        profile_picture: null
    };

    testUserId = await createUser(firstUser);
    secondTestUserId = await createUser(secondUser);

    const noteId = await createNote({
        user_id: testUserId,
        title: "Private Note",
        content: "This note belongs to the first user."
    });

    testNoteIds.push(noteId);

    const note = await getNoteById(noteId, secondTestUserId);

    expect(note).to.be.null;
});

it("should update a user's note", async () => {
    const testUser = {
        name: "Update Note User",
        email: `update_note_${Date.now()}@example.com`,
        password: "hashed_test_password",
        profile_picture: null
    };

    testUserId = await createUser(testUser);

    const noteId = await createNote({
        user_id: testUserId,
        title: "Original Title",
        content: "Original Content"
    });

    testNoteIds.push(noteId);

    const affectedRows = await updateNote(
        noteId,
        testUserId,
        {
            title: "Updated Title",
            content: "Updated Content"
        }
    );

    expect(affectedRows).to.equal(1);

    const updatedNote = await getNoteById(noteId, testUserId);

    expect(updatedNote.title).to.equal("Updated Title");
    expect(updatedNote.content).to.equal("Updated Content");
});

it("should not allow a user to update another user's note", async () => {
    const firstUser = {
        name: "Note Owner",
        email: `update_owner_${Date.now()}@example.com`,
        password: "hashed_test_password",
        profile_picture: null
    };

    const secondUser = {
        name: "Other User",
        email: `update_other_${Date.now()}@example.com`,
        password: "hashed_test_password",
        profile_picture: null
    };

    testUserId = await createUser(firstUser);
    secondTestUserId = await createUser(secondUser);

    const noteId = await createNote({
        user_id: testUserId,
        title: "Original Private Title",
        content: "Original Private Content"
    });

    testNoteIds.push(noteId);

    const affectedRows = await updateNote(
        noteId,
        secondTestUserId,
        {
            title: "Hacked Title",
            content: "Hacked Content"
        }
    );

    expect(affectedRows).to.equal(0);

    const originalNote = await getNoteById(noteId, testUserId);

    expect(originalNote.title).to.equal("Original Private Title");
    expect(originalNote.content).to.equal("Original Private Content");
});

it("should delete a user's note", async () => {
    const testUser = {
        name: "Delete Note User",
        email: `delete_note_${Date.now()}@example.com`,
        password: "hashed_test_password",
        profile_picture: null
    };

    testUserId = await createUser(testUser);

    const noteId = await createNote({
        user_id: testUserId,
        title: "Delete Test Note",
        content: "This note should be deleted."
    });

    testNoteIds.push(noteId);

    const affectedRows = await deleteNote(noteId, testUserId);

    expect(affectedRows).to.equal(1);

    const deletedNote = await getNoteById(noteId, testUserId);

    expect(deletedNote).to.be.null;

    testNoteIds = [];
});

it("should not allow a user to delete another user's note", async () => {
    const firstUser = {
        name: "Delete Note Owner",
        email: `delete_owner_${Date.now()}@example.com`,
        password: "hashed_test_password",
        profile_picture: null
    };

    const secondUser = {
        name: "Delete Other User",
        email: `delete_other_${Date.now()}@example.com`,
        password: "hashed_test_password",
        profile_picture: null
    };

    testUserId = await createUser(firstUser);
    secondTestUserId = await createUser(secondUser);

    const noteId = await createNote({
        user_id: testUserId,
        title: "Protected Note",
        content: "This note belongs to User A."
    });

    testNoteIds.push(noteId);

    const affectedRows = await deleteNote(
        noteId,
        secondTestUserId
    );

    expect(affectedRows).to.equal(0);

    const note = await getNoteById(noteId, testUserId);

    expect(note).to.not.be.null;
    expect(note.title).to.equal("Protected Note");
});


    it("should pin and unpin a user's note", async () => {
        const testUser = {
            name: "Pin Test User",
            email: `pin_test_${Date.now()}@example.com`,
            password: "hashed_test_password",
            profile_picture: null
        };

        testUserId = await createUser(testUser);

        const noteId = await createNote({
            user_id: testUserId,
            title: "Pin Test Note",
            content: "Testing pin functionality."
        });

        testNoteIds.push(noteId);

        const pinResult = await togglePin(
            noteId,
            testUserId,
            true
        );

        expect(pinResult).to.equal(1);

        const pinnedNote = await getNoteById(
            noteId,
            testUserId
        );

        expect(pinnedNote.is_pinned).to.equal(1);

        const unpinResult = await togglePin(
            noteId,
            testUserId,
            false
        );

        expect(unpinResult).to.equal(1);

        const unpinnedNote = await getNoteById(
            noteId,
            testUserId
        );

        expect(unpinnedNote.is_pinned).to.equal(0);
    });

    // --------------------------------------------------
    // PINNED NOTES
    // --------------------------------------------------

    it("should get only pinned notes", async () => {
        const testUser = {
            name: "Pinned List User",
            email: `pinned_list_${Date.now()}@example.com`,
            password: "hashed_test_password",
            profile_picture: null
        };

        testUserId = await createUser(testUser);

        const pinnedNoteId = await createNote({
            user_id: testUserId,
            title: "Pinned Note",
            content: "This note is pinned."
        });

        const normalNoteId = await createNote({
            user_id: testUserId,
            title: "Normal Note",
            content: "This note is not pinned."
        });

        testNoteIds.push(
            pinnedNoteId,
            normalNoteId
        );

        await togglePin(
            pinnedNoteId,
            testUserId,
            true
        );

        const pinnedNotes = await getPinnedNotes(
            testUserId
        );

        expect(pinnedNotes).to.be.an("array");
        expect(pinnedNotes).to.have.lengthOf(1);
        expect(pinnedNotes[0].id).to.equal(pinnedNoteId);
        expect(pinnedNotes[0].is_pinned).to.equal(1);
    });

    // --------------------------------------------------
    // ARCHIVE / UNARCHIVE
    // --------------------------------------------------

    it("should archive and unarchive a user's note", async () => {
        const testUser = {
            name: "Archive Test User",
            email: `archive_test_${Date.now()}@example.com`,
            password: "hashed_test_password",
            profile_picture: null
        };

        testUserId = await createUser(testUser);

        const noteId = await createNote({
            user_id: testUserId,
            title: "Archive Test Note",
            content: "Testing archive functionality."
        });

        testNoteIds.push(noteId);

        const archiveResult = await toggleArchive(
            noteId,
            testUserId,
            true
        );

        expect(archiveResult).to.equal(1);

        const archivedNote = await getNoteById(
            noteId,
            testUserId
        );

        expect(archivedNote.is_archived).to.equal(1);

        const unarchiveResult = await toggleArchive(
            noteId,
            testUserId,
            false
        );

        expect(unarchiveResult).to.equal(1);

        const unarchivedNote = await getNoteById(
            noteId,
            testUserId
        );

        expect(unarchivedNote.is_archived).to.equal(0);
    });

    // --------------------------------------------------
    // ARCHIVED NOTES
    // --------------------------------------------------

    it("should get only archived notes", async () => {
        const testUser = {
            name: "Archived List User",
            email: `archived_list_${Date.now()}@example.com`,
            password: "hashed_test_password",
            profile_picture: null
        };

        testUserId = await createUser(testUser);

        const archivedNoteId = await createNote({
            user_id: testUserId,
            title: "Archived Note",
            content: "This note is archived."
        });

        const normalNoteId = await createNote({
            user_id: testUserId,
            title: "Normal Note",
            content: "This note is not archived."
        });

        testNoteIds.push(
            archivedNoteId,
            normalNoteId
        );

        await toggleArchive(
            archivedNoteId,
            testUserId,
            true
        );

        const archivedNotes = await getArchivedNotes(
            testUserId
        );

        expect(archivedNotes).to.be.an("array");
        expect(archivedNotes).to.have.lengthOf(1);
        expect(archivedNotes[0].id).to.equal(archivedNoteId);
        expect(archivedNotes[0].is_archived).to.equal(1);
    });

    // --------------------------------------------------
    // TIMESTAMPS
    // --------------------------------------------------

    it("should create timestamps for a note", async () => {
        const testUser = {
            name: "Timestamp User",
            email: `timestamp_${Date.now()}@example.com`,
            password: "hashed_test_password",
            profile_picture: null
        };

        testUserId = await createUser(testUser);

        const noteId = await createNote({
            user_id: testUserId,
            title: "Timestamp Note",
            content: "Testing timestamps."
        });

        testNoteIds.push(noteId);

        const note = await getNoteById(
            noteId,
            testUserId
        );

        expect(note.created_at).to.not.be.null;
        expect(note.updated_at).to.not.be.null;
    });

    // --------------------------------------------------
    // USER ISOLATION FOR PINNING
    // --------------------------------------------------

    it("should not allow a user to pin another user's note", async () => {
        const firstUser = {
            name: "Pin Owner",
            email: `pin_owner_${Date.now()}@example.com`,
            password: "hashed_test_password",
            profile_picture: null
        };

        const secondUser = {
            name: "Pin Other User",
            email: `pin_other_${Date.now()}@example.com`,
            password: "hashed_test_password",
            profile_picture: null
        };

        testUserId = await createUser(firstUser);
        secondTestUserId = await createUser(secondUser);

        const noteId = await createNote({
            user_id: testUserId,
            title: "Protected Pin Note",
            content: "This note belongs to User A."
        });

        testNoteIds.push(noteId);

        const affectedRows = await togglePin(
            noteId,
            secondTestUserId,
            true
        );

        expect(affectedRows).to.equal(0);

        const note = await getNoteById(
            noteId,
            testUserId
        );

        expect(note.is_pinned).to.equal(0);
    });
    
  afterEach(async () => {
    for (const noteId of testNoteIds) {
        await deleteNote(noteId, testUserId);
    }

    testNoteIds = [];

    if (testUserId) {
        await deleteUser(testUserId);
        testUserId = null;
    }

    if (secondTestUserId) {
        await deleteUser(secondTestUserId);
        secondTestUserId = null;
    }
});

});