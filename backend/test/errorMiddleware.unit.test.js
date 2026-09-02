process.env.NODE_ENV = "test";
const { expect } = require("chai");
const sinon = require("sinon");
const errorMiddleware = require("../src/middleware/errorMiddleware");
const logger = require("../src/logger/logger");
const mockRes = require("./helpers/mockRes");

describe("errorMiddleware - unit tests (uncovered branches)", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("returns the original error message for non-500 status codes", () => {
        const err = new Error("Validation failed");
        err.statusCode = 400;

        const req = {};
        const res = mockRes();
        const next = sinon.stub();

        errorMiddleware(err, req, res, next);

        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.equal("Validation failed");
    });

    it("falls back to a generic message when a non-500 error has no message", () => {
        const err = { status: 403 };

        const req = {};
        const res = mockRes();
        const next = sinon.stub();

        errorMiddleware(err, req, res, next);

        expect(res.statusCode).to.equal(403);
        expect(res.body.message).to.equal("Something went wrong");
    });

    it("does not crash when logger.error is not a function", () => {
        const originalError = logger.error;
        logger.error = undefined;

        try {
            const err = new Error("Some failure");
            const req = {};
            const res = mockRes();
            const next = sinon.stub();

            errorMiddleware(err, req, res, next);

            expect(res.statusCode).to.equal(500);
            expect(res.body.message).to.equal("Internal Server Error");
        } finally {
            logger.error = originalError;
        }
    });

    it("logs the error message when the error has no stack", () => {
        const logSpy = sinon.spy(logger, "error");
        const err = { message: "No stack here" };

        const req = {};
        const res = mockRes();
        const next = sinon.stub();

        errorMiddleware(err, req, res, next);

        expect(logSpy.calledWith("No stack here")).to.equal(true);
    });

    it("logs the raw error when it has neither a stack nor a message", () => {
        const logSpy = sinon.spy(logger, "error");
        const err = "raw string error";

        const req = {};
        const res = mockRes();
        const next = sinon.stub();

        errorMiddleware(err, req, res, next);

        expect(logSpy.calledWith("raw string error")).to.equal(true);
    });
});