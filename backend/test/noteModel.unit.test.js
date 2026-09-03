process.env.NODE_ENV = "test";
const { expect } = require("chai");
const sinon = require("sinon");
const noteModel = require("../src/models/noteModel");
const pool = require("../src/config/db");
const logger = require("../src/logger/logger");

describe("noteModel - unit tests (uncovered branches)", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("createNote throws when noteData is missing entirely", async () => {
        try {
            await noteModel.createNote(undefined);
            throw new Error("Expected createNote to throw");
        } catch (error) {
            expect(error.message).to.equal("Note data is required");
        }
    });

  it("createNote logs and rethrows when the DB insert fails", async () => {
    sinon.stub(pool, "execute").rejects(new Error("DB insert failure"));
    const loggerSpy = sinon.stub(logger, "error");

    try {
        await noteModel.createNote({ user_id: 1, title: "Title", content: "Content" });
        throw new Error("Expected createNote to throw");
    } catch (error) {
        expect(error.message).to.equal("DB insert failure");
    }

    expect(loggerSpy.calledOnce).to.equal(true);
    expect(loggerSpy.firstCall.args[0]).to.include("Error in createNote");
    expect(loggerSpy.firstCall.args[0]).to.include("DB insert failure");
});

    it("getNotesByUser logs and rethrows when the DB query fails", async () => {
        sinon.stub(pool, "execute").rejects(new Error("DB query failure"));

        try {
            await noteModel.getNotesByUser(1);
            throw new Error("Expected getNotesByUser to throw");
        } catch (error) {
            expect(error.message).to.equal("DB query failure");
        }
    });

    it("getNoteById logs and rethrows when the DB query fails", async () => {
        sinon.stub(pool, "execute").rejects(new Error("DB query failure"));

        try {
            await noteModel.getNoteById(1, 1);
            throw new Error("Expected getNoteById to throw");
        } catch (error) {
            expect(error.message).to.equal("DB query failure");
        }
    });

    it("updateNote logs and rethrows when the DB update fails", async () => {
        sinon.stub(pool, "execute").rejects(new Error("DB update failure"));

        try {
            await noteModel.updateNote(1, 1, { title: "New Title" });
            throw new Error("Expected updateNote to throw");
        } catch (error) {
            expect(error.message).to.equal("DB update failure");
        }
    });

    it("deleteNote logs and rethrows when the DB delete fails", async () => {
        sinon.stub(pool, "execute").rejects(new Error("DB delete failure"));

        try {
            await noteModel.deleteNote(1, 1);
            throw new Error("Expected deleteNote to throw");
        } catch (error) {
            expect(error.message).to.equal("DB delete failure");
        }
    });

    it("togglePin logs and rethrows when the DB update fails", async () => {
        sinon.stub(pool, "execute").rejects(new Error("DB update failure"));

        try {
            await noteModel.togglePin(1, 1, 1);
            throw new Error("Expected togglePin to throw");
        } catch (error) {
            expect(error.message).to.equal("DB update failure");
        }
    });

    it("toggleArchive logs and rethrows when the DB update fails", async () => {
        sinon.stub(pool, "execute").rejects(new Error("DB update failure"));

        try {
            await noteModel.toggleArchive(1, 1, 1);
            throw new Error("Expected toggleArchive to throw");
        } catch (error) {
            expect(error.message).to.equal("DB update failure");
        }
    });

    it("getPinnedNotes logs and rethrows when the DB query fails", async () => {
        sinon.stub(pool, "execute").rejects(new Error("DB query failure"));

        try {
            await noteModel.getPinnedNotes(1);
            throw new Error("Expected getPinnedNotes to throw");
        } catch (error) {
            expect(error.message).to.equal("DB query failure");
        }
    });

    it("getArchivedNotes logs and rethrows when the DB query fails", async () => {
        sinon.stub(pool, "execute").rejects(new Error("DB query failure"));

        try {
            await noteModel.getArchivedNotes(1);
            throw new Error("Expected getArchivedNotes to throw");
        } catch (error) {
            expect(error.message).to.equal("DB query failure");
        }
    });

 it("searchNotes logs and rethrows when the DB query fails", async () => {
    sinon.stub(pool, "execute").rejects(new Error("DB query failure"));
    const loggerSpy = sinon.stub(logger, "error");

    try {
        await noteModel.searchNotes(1, {});
        throw new Error("Expected searchNotes to throw");
    } catch (error) {
        expect(error.message).to.equal("DB query failure");
    }

    expect(loggerSpy.calledOnce).to.equal(true);
    expect(loggerSpy.firstCall.args[0]).to.include("Error in searchNotes for userId 1");
    expect(loggerSpy.firstCall.args[0]).to.include("DB query failure");
});
});