process.env.NODE_ENV = "test";
const { expect } = require("chai");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../src/middleware/authMiddleware");
const mockRes = require("./helpers/mockRes");

describe("authMiddleware - unit tests (uncovered branches)", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("throws when JWT_SECRET is unset and NODE_ENV is not test", () => {
        const originalSecret = process.env.JWT_SECRET;
        const originalEnv = process.env.NODE_ENV;

        delete process.env.JWT_SECRET;
        process.env.NODE_ENV = "production";

        const req = { headers: { authorization: "Bearer sometoken" } };
        const res = mockRes();
        const next = sinon.stub();

        authenticateToken(req, res, next);

        expect(next.called).to.equal(true);
        expect(next.firstCall.args[0].message).to.equal("JWT_SECRET environment variable is not defined.");
        process.env.JWT_SECRET = originalSecret;
        process.env.NODE_ENV = originalEnv;
    });

    it("calls next(error) when jwt.verify throws a non-JWT error", () => {
        sinon.stub(jwt, "verify").throws(new Error("Unexpected failure"));

        const req = { headers: { authorization: "Bearer sometoken" } };
        const res = mockRes();
        const next = sinon.stub();

        authenticateToken(req, res, next);

        expect(next.called).to.equal(true);
        expect(next.firstCall.args[0].message).to.equal("Unexpected failure");
    });
        it("returns 401 when the Bearer prefix has no token after it", () => {
        const req = { headers: { authorization: "Bearer " } };
        const res = mockRes();
        const next = sinon.stub();

        authenticateToken(req, res, next);

        expect(res.statusCode).to.equal(401);
    });
});