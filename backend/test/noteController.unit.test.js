process.env.NODE_ENV = "test";
const { expect } = require("chai");
const sinon = require("sinon");
const noteController = require("../src/controllers/noteController");
const noteModel = require("../src/models/noteModel");
const mockRes = require("./helpers/mockRes");

describe("noteController - unit tests (catch blocks)", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("createNote calls next(error) when noteModel.createNote throws", async () => {
        sinon.stub(noteModel, "createNote").rejects(new Error("DB failure"));

        const req = { body: { title: "Title", content: "Content" }, user: { id: 1 } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.createNote(req, res, next);

        expect(next.called).to.equal(true);
    });

    it("getNotes calls next(error) when noteModel.getNotesByUser throws", async () => {
        sinon.stub(noteModel, "getNotesByUser").rejects(new Error("DB failure"));

        const req = { user: { id: 1 } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.getNotes(req, res, next);

        expect(next.called).to.equal(true);
    });

    it("getNoteById calls next(error) when noteModel.getNoteById throws", async () => {
        sinon.stub(noteModel, "getNoteById").rejects(new Error("DB failure"));

        const req = { params: { id: 1 }, user: { id: 1 } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.getNoteById(req, res, next);

        expect(next.called).to.equal(true);
    });

    it("updateNote calls next(error) when noteModel.getNoteById throws", async () => {
        sinon.stub(noteModel, "getNoteById").rejects(new Error("DB failure"));

        const req = { params: { id: 1 }, user: { id: 1 }, body: {} };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.updateNote(req, res, next);

        expect(next.called).to.equal(true);
    });

    it("deleteNote calls next(error) when noteModel.getNoteById throws", async () => {
        sinon.stub(noteModel, "getNoteById").rejects(new Error("DB failure"));

        const req = { params: { id: 1 }, user: { id: 1 } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.deleteNote(req, res, next);

        expect(next.called).to.equal(true);
    });

    it("togglePin calls next(error) when noteModel.togglePin throws", async () => {
        sinon.stub(noteModel, "togglePin").rejects(new Error("DB failure"));

        const req = { params: { id: 1 }, user: { id: 1 }, body: { is_pinned: true } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.togglePin(req, res, next);

        expect(next.called).to.equal(true);
    });

    it("toggleArchive calls next(error) when noteModel.toggleArchive throws", async () => {
        sinon.stub(noteModel, "toggleArchive").rejects(new Error("DB failure"));

        const req = { params: { id: 1 }, user: { id: 1 }, body: { is_archived: true } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.toggleArchive(req, res, next);

        expect(next.called).to.equal(true);
    });

    it("getPinnedNotes calls next(error) when noteModel.getPinnedNotes throws", async () => {
        sinon.stub(noteModel, "getPinnedNotes").rejects(new Error("DB failure"));

        const req = { user: { id: 1 } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.getPinnedNotes(req, res, next);

        expect(next.called).to.equal(true);
    });

    it("getArchivedNotes calls next(error) when noteModel.getArchivedNotes throws", async () => {
        sinon.stub(noteModel, "getArchivedNotes").rejects(new Error("DB failure"));

        const req = { user: { id: 1 } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.getArchivedNotes(req, res, next);

        expect(next.called).to.equal(true);
    });

    it("searchNotes calls next(error) when noteModel.searchNotes throws", async () => {
        sinon.stub(noteModel, "searchNotes").rejects(new Error("DB failure"));

        const req = { user: { id: 1 }, query: {} };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.searchNotes(req, res, next);

        expect(next.called).to.equal(true);
    });
        it("createNote handles a completely missing request body", async () => {
        const req = { user: { id: 1 } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.createNote(req, res, next);

        expect(res.statusCode).to.equal(400);
    });

    it("updateNote handles a completely missing request body", async () => {
        sinon.stub(noteModel, "getNoteById")
            .onFirstCall().resolves({ id: 1, title: "T", content: "C", is_pinned: 0, is_archived: 0 })
            .onSecondCall().resolves({ id: 1, title: "T", content: "C", is_pinned: 0, is_archived: 0 });
        sinon.stub(noteModel, "updateNote").resolves();

        const req = { params: { id: 1 }, user: { id: 1 } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.updateNote(req, res, next);

        expect(res.statusCode).to.equal(200);
    });

    it("updateNote falls back to a constructed object when the refetch returns nothing", async () => {
        sinon.stub(noteModel, "getNoteById")
            .onFirstCall().resolves({ id: 1, title: "T", content: "C", is_pinned: 0, is_archived: 0 })
            .onSecondCall().resolves(null);
        sinon.stub(noteModel, "updateNote").resolves();

        const req = { params: { id: 1 }, user: { id: 1 }, body: { title: "Updated" } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.updateNote(req, res, next);

        expect(res.statusCode).to.equal(200);
        expect(res.body.data.title).to.equal("Updated");
    });

    it("togglePin handles a completely missing request body", async () => {
        sinon.stub(noteModel, "togglePin").resolves(1);
        sinon.stub(noteModel, "getNoteById").resolves({ id: 1 });

        const req = { params: { id: 1 }, user: { id: 1 } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.togglePin(req, res, next);

        expect(res.statusCode).to.equal(200);
    });

    it("toggleArchive handles a completely missing request body", async () => {
        sinon.stub(noteModel, "toggleArchive").resolves(1);
        sinon.stub(noteModel, "getNoteById").resolves({ id: 1 });

        const req = { params: { id: 1 }, user: { id: 1 } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.toggleArchive(req, res, next);

        expect(res.statusCode).to.equal(200);
    });

    it("searchNotes handles a completely missing query object", async () => {
        sinon.stub(noteModel, "searchNotes").resolves([]);

        const req = { user: { id: 1 } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.searchNotes(req, res, next);

        expect(res.statusCode).to.equal(200);
    });

    it("createNote falls back to user_id when id is absent from req.user", async () => {
        sinon.stub(noteModel, "createNote").resolves(101);
        sinon.stub(noteModel, "getNoteById").resolves({ id: 101 });

        const req = { user: { user_id: 42 }, body: { title: "T", content: "C" } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.createNote(req, res, next);

        expect(noteModel.createNote.firstCall.args[0].user_id).to.equal(42);
    });

    it("getNotes falls back to user_id when id is absent from req.user", async () => {
        const stub = sinon.stub(noteModel, "getNotesByUser").resolves([]);

        const req = { user: { user_id: 42 } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.getNotes(req, res, next);

        expect(stub.calledWith(42)).to.equal(true);
    });

    it("getNoteById falls back to user_id when id is absent from req.user", async () => {
        const stub = sinon.stub(noteModel, "getNoteById").resolves({ id: 1 });

        const req = { params: { id: 1 }, user: { user_id: 42 } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.getNoteById(req, res, next);

        expect(stub.calledWith(1, 42)).to.equal(true);
    });

    it("updateNote falls back to user_id when id is absent from req.user", async () => {
        sinon.stub(noteModel, "getNoteById").resolves({ id: 1, title: "T", content: "C", is_pinned: 0, is_archived: 0 });
        const updateStub = sinon.stub(noteModel, "updateNote").resolves();

        const req = { params: { id: 1 }, user: { user_id: 42 }, body: {} };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.updateNote(req, res, next);

        expect(updateStub.calledWith(1, 42)).to.equal(true);
    });

    it("deleteNote falls back to user_id when id is absent from req.user", async () => {
        sinon.stub(noteModel, "getNoteById").resolves({ id: 1 });
        const deleteStub = sinon.stub(noteModel, "deleteNote").resolves();

        const req = { params: { id: 1 }, user: { user_id: 42 } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.deleteNote(req, res, next);

        expect(deleteStub.calledWith(1, 42)).to.equal(true);
    });

    it("togglePin falls back to user_id when id is absent from req.user", async () => {
        const stub = sinon.stub(noteModel, "togglePin").resolves(1);
        sinon.stub(noteModel, "getNoteById").resolves({ id: 1 });

        const req = { params: { id: 1 }, user: { user_id: 42 }, body: { is_pinned: true } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.togglePin(req, res, next);

        expect(stub.calledWith(1, 42, 1)).to.equal(true);
    });

    it("toggleArchive falls back to user_id when id is absent from req.user", async () => {
        const stub = sinon.stub(noteModel, "toggleArchive").resolves(1);
        sinon.stub(noteModel, "getNoteById").resolves({ id: 1 });

        const req = { params: { id: 1 }, user: { user_id: 42 }, body: { is_archived: true } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.toggleArchive(req, res, next);

        expect(stub.calledWith(1, 42, 1)).to.equal(true);
    });

    it("getPinnedNotes falls back to user_id when id is absent from req.user", async () => {
        const stub = sinon.stub(noteModel, "getPinnedNotes").resolves([]);

        const req = { user: { user_id: 42 } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.getPinnedNotes(req, res, next);

        expect(stub.calledWith(42)).to.equal(true);
    });

    it("getArchivedNotes falls back to user_id when id is absent from req.user", async () => {
        const stub = sinon.stub(noteModel, "getArchivedNotes").resolves([]);

        const req = { user: { user_id: 42 } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.getArchivedNotes(req, res, next);

        expect(stub.calledWith(42)).to.equal(true);
    });

    it("searchNotes falls back to user_id when id is absent from req.user", async () => {
        const stub = sinon.stub(noteModel, "searchNotes").resolves([]);

        const req = { user: { user_id: 42 }, query: {} };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.searchNotes(req, res, next);

        expect(stub.calledWith(42)).to.equal(true);
    });
        it("createNote falls back to constructed data when the refetch returns nothing", async () => {
        sinon.stub(noteModel, "createNote").resolves(55);
        sinon.stub(noteModel, "getNoteById").resolves(null);

        const req = { user: { id: 1 }, body: { title: "Title", content: "Content" } };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.createNote(req, res, next);

        expect(res.statusCode).to.equal(201);
        expect(res.body.data.id).to.equal(55);
    });

    it("searchNotes returns count 0 when the model does not return an array", async () => {
        sinon.stub(noteModel, "searchNotes").resolves(null);

        const req = { user: { id: 1 }, query: {} };
        const res = mockRes();
        const next = sinon.stub();

        await noteController.searchNotes(req, res, next);

        expect(res.statusCode).to.equal(200);
        expect(res.body.count).to.equal(0);
    });
});