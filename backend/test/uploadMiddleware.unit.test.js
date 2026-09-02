process.env.NODE_ENV = "test";
const { expect } = require("chai");
const sinon = require("sinon");
const fs = require("fs");
const { validateImageContent } = require("../src/middleware/uploadMiddleware");
const mockRes = require("./helpers/mockRes");

describe("uploadMiddleware - unit tests (uncovered branches)", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("calls next() when no file was uploaded", () => {
        const req = {};
        const res = mockRes();
        const next = sinon.stub();

        validateImageContent(req, res, next);

        expect(next.called).to.equal(true);
    });

    it("returns 500 when the uploaded file cannot be opened", (done) => {
        sinon.stub(fs, "open").callsFake((filePath, mode, cb) => {
            cb(new Error("Cannot open file"));
        });

        const req = { file: { path: "fake/path.jpg" } };
        const res = mockRes();
        const next = sinon.stub();

        res.json = (payload) => {
            res.body = payload;
            expect(res.statusCode).to.equal(500);
            done();
        };

        validateImageContent(req, res, next);
    });

    it("returns 500 and deletes the file when reading its contents fails", (done) => {
        sinon.stub(fs, "open").callsFake((filePath, mode, cb) => cb(null, 1));
        sinon.stub(fs, "close").callsFake((fd, cb) => cb(null));
        sinon.stub(fs, "read").callsFake((fd, buffer, offset, length, position, cb) => {
            cb(new Error("Read failure"));
        });
        const unlinkStub = sinon.stub(fs, "unlink").callsFake((filePath, cb) => cb(null));

        const req = { file: { path: "fake/path.jpg" } };
        const res = mockRes();
        const next = sinon.stub();

        res.json = (payload) => {
            res.body = payload;
            expect(res.statusCode).to.equal(500);
            expect(unlinkStub.called).to.equal(true);
            done();
        };

        validateImageContent(req, res, next);
    });

    it("creates the uploads directory when it does not exist", () => {
        sinon.stub(fs, "existsSync").returns(false);
        const mkdirStub = sinon.stub(fs, "mkdirSync");

        const modulePath = require.resolve("../src/middleware/uploadMiddleware");
        const originalModule = require.cache[modulePath];
        delete require.cache[modulePath];

        require("../src/middleware/uploadMiddleware");

        expect(mkdirStub.called).to.equal(true);

        delete require.cache[modulePath];
        require.cache[modulePath] = originalModule;
    });
        it("logs an error when closing the file descriptor fails after a successful read", (done) => {
        const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);
        sinon.stub(fs, "open").callsFake((filePath, mode, cb) => cb(null, 1));
        sinon.stub(fs, "read").callsFake((fd, buffer, offset, length, position, cb) => {
            jpegBuffer.copy(buffer);
            cb(null, jpegBuffer.length);
        });
        sinon.stub(fs, "close").callsFake((fd, cb) => cb(new Error("Close failure")));
        const errorSpy = sinon.stub(console, "error");

        const req = { file: { path: "fake/path.jpg" } };
        const res = mockRes();
        const next = () => {
            expect(errorSpy.calledWith("Error closing file descriptor:", sinon.match.instanceOf(Error))).to.equal(true);
            done();
        };

        validateImageContent(req, res, next);
    });

    it("logs an error when deleting an invalid file fails", (done) => {
        const invalidBuffer = Buffer.from("not a real image");
        sinon.stub(fs, "open").callsFake((filePath, mode, cb) => cb(null, 1));
        sinon.stub(fs, "read").callsFake((fd, buffer, offset, length, position, cb) => {
            invalidBuffer.copy(buffer);
            cb(null, invalidBuffer.length);
        });
        sinon.stub(fs, "close").callsFake((fd, cb) => cb(null));
        sinon.stub(fs, "unlink").callsFake((filePath, cb) => cb(new Error("Unlink failure")));
        const errorSpy = sinon.stub(console, "error");

        const req = { file: { path: "fake/path.png" } };
        const res = mockRes();
        const next = sinon.stub();

        res.json = (payload) => {
            res.body = payload;
            expect(res.statusCode).to.equal(400);
            expect(errorSpy.calledWith("Failed to delete invalid file:", sinon.match.instanceOf(Error))).to.equal(true);
            done();
        };

        validateImageContent(req, res, next);
    });
});