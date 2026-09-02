process.env.NODE_ENV = "test";
const { expect } = require("chai");
const sinon = require("sinon");
const authController = require("../src/controllers/authController");
const userModel = require("../src/models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function mockRes() {
    return {
        statusCode: null,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.body = payload; return this; }
    };
}

describe("authController - unit tests (uncovered branches)", () => {
    afterEach(() => {
        sinon.restore();
    });

    describe("getJwtSecret", () => {
        it("throws when JWT_SECRET is unset and NODE_ENV is not test", () => {
            const originalSecret = process.env.JWT_SECRET;
            const originalEnv = process.env.NODE_ENV;

            delete process.env.JWT_SECRET;
            process.env.NODE_ENV = "production";

            expect(() => authController.getJwtSecret()).to.throw(
                "JWT_SECRET environment variable is not defined."
            );

            process.env.JWT_SECRET = originalSecret;
            process.env.NODE_ENV = originalEnv;
        });
            describe("getJwtSecret - fallback to testsecret", () => {
        it("returns testsecret when JWT_SECRET is unset in test environment", () => {
            const originalSecret = process.env.JWT_SECRET;
            delete process.env.JWT_SECRET;

            const secret = authController.getJwtSecret();
            expect(secret).to.equal("testsecret");

            process.env.JWT_SECRET = originalSecret;
        });
    });

    describe("register - missing req.body", () => {
        it("returns 400 when req.body is undefined", async () => {
            const req = {};
            const res = mockRes();
            const next = sinon.stub();

            await authController.register(req, res, next);

            expect(res.statusCode).to.equal(400);
        });
    });

    describe("login - missing req.body", () => {
        it("returns 400 when req.body is undefined", async () => {
            const req = {};
            const res = mockRes();
            const next = sinon.stub();

            await authController.login(req, res, next);

            expect(res.statusCode).to.equal(400);
        });
    });

    describe("login - nested user email extraction", () => {
        it("extracts email from a nested user object when top-level email is absent", async () => {
            sinon.stub(userModel, "findUserByEmail").resolves({ id: 1, password: "hashedpw", email: "nested@example.com" });
            sinon.stub(bcrypt, "compare").resolves(true);
            sinon.stub(jwt, "sign").returns("faketoken");

            const req = {
                body: {
                    emailOrUsername: { user: { email: "nested@example.com" } },
                    password: "password123"
                }
            };
            const res = mockRes();
            const next = sinon.stub();

            await authController.login(req, res, next);

            expect(res.statusCode).to.equal(200);
        });
    });

    describe("login - user record with no password", () => {
        it("returns 401 when the user record has no password field", async () => {
            sinon.stub(userModel, "findUserByEmail").resolves({ id: 1, email: "nopassword@example.com" });
            sinon.stub(bcrypt, "compare").resolves(false);

            const req = { body: { email: "nopassword@example.com", password: "password123" } };
            const res = mockRes();
            const next = sinon.stub();

            await authController.login(req, res, next);

            expect(res.statusCode).to.equal(401);
        });
    });

    describe("updateProfile - missing req.body", () => {
        it("returns 200 when req.body is undefined and name falls back to the current name", async () => {
            sinon.stub(userModel, "findUserById")
                .onFirstCall().resolves({ id: 1, name: "Existing", profile_picture: null })
                .onSecondCall().resolves({ id: 1, name: "Existing", email: "a@a.com", profile_picture: null });
            sinon.stub(userModel, "updateUserProfile").resolves();

            const req = { user: { id: 1 } };
            const res = mockRes();
            const next = sinon.stub();

            await authController.updateProfile(req, res, next);

            expect(res.statusCode).to.equal(200);
        });
    });

    describe("updateProfile - file upload branch", () => {
        it("builds the profile picture path when a file is uploaded", async () => {
            sinon.stub(userModel, "findUserById")
                .onFirstCall().resolves({ id: 1, name: "Existing", profile_picture: null })
                .onSecondCall().resolves({ id: 1, name: "Existing", email: "a@a.com", profile_picture: "/uploads/test.png" });
            sinon.stub(userModel, "updateUserProfile").resolves();

            const req = {
                user: { id: 1 },
                body: {},
                file: { filename: "test.png" }
            };
            const res = mockRes();
            const next = sinon.stub();

            await authController.updateProfile(req, res, next);

            expect(res.statusCode).to.equal(200);
            expect(res.body.data.profile_picture).to.equal("/uploads/test.png");
        });
    });
    });

    describe("register - DB error branches", () => {
        it("returns 409 when createUser throws ER_DUP_ENTRY", async () => {
            sinon.stub(userModel, "findUserByEmail").resolves(null);
            sinon.stub(bcrypt, "hash").resolves("hashedpw");
            const dupError = new Error("Duplicate");
            dupError.code = "ER_DUP_ENTRY";
            sinon.stub(userModel, "createUser").rejects(dupError);

            const req = { body: { name: "Test", email: "dup@example.com", password: "password123" } };
            const res = mockRes();
            const next = sinon.stub();

            await authController.register(req, res, next);

            expect(res.statusCode).to.equal(409);
            expect(res.body.success).to.equal(false);
        });

        it("calls next(error) when createUser throws a non-duplicate error", async () => {
            sinon.stub(userModel, "findUserByEmail").resolves(null);
            sinon.stub(bcrypt, "hash").resolves("hashedpw");
            const genericError = new Error("Something else broke");
            sinon.stub(userModel, "createUser").rejects(genericError);

            const req = { body: { name: "Test", email: "err@example.com", password: "password123" } };
            const res = mockRes();
            const next = sinon.stub();

            await authController.register(req, res, next);

            expect(next.calledWith(genericError)).to.equal(true);
        });
    });

    describe("login - catch block", () => {
        it("calls next(error) when bcrypt.compare throws", async () => {
            sinon.stub(userModel, "findUserByEmail").resolves({ id: 1, password: "hash", email: "a@a.com" });
            sinon.stub(bcrypt, "compare").rejects(new Error("bcrypt failure"));

            const req = { body: { email: "a@a.com", password: "password123" } };
            const res = mockRes();
            const next = sinon.stub();

            await authController.login(req, res, next);

            expect(next.called).to.equal(true);
        });
    });

    describe("getProfile", () => {
        it("returns 404 when user is not found", async () => {
            sinon.stub(userModel, "findUserById").resolves(null);

            const req = { user: { id: 999 } };
            const res = mockRes();
            const next = sinon.stub();

            await authController.getProfile(req, res, next);

            expect(res.statusCode).to.equal(404);
        });

        it("returns 200 with user data when found", async () => {
            sinon.stub(userModel, "findUserById").resolves({
                id: 1, name: "Test", email: "a@a.com", profile_picture: null
            });

            const req = { user: { id: 1 } };
            const res = mockRes();
            const next = sinon.stub();

            await authController.getProfile(req, res, next);

            expect(res.statusCode).to.equal(200);
            expect(res.body.data.email).to.equal("a@a.com");
        });

        it("calls next(error) when findUserById throws", async () => {
            sinon.stub(userModel, "findUserById").rejects(new Error("DB down"));

            const req = { user: { id: 1 } };
            const res = mockRes();
            const next = sinon.stub();

            await authController.getProfile(req, res, next);

            expect(next.called).to.equal(true);
        });
    });

    describe("updateProfile", () => {
        it("returns 404 when user is not found", async () => {
            sinon.stub(userModel, "findUserById").resolves(null);

            const req = { user: { id: 999 }, body: {} };
            const res = mockRes();
            const next = sinon.stub();

            await authController.updateProfile(req, res, next);

            expect(res.statusCode).to.equal(404);
        });

        it("returns 400 when new password is too short", async () => {
            sinon.stub(userModel, "findUserById").resolves({ id: 1, name: "Test", profile_picture: null });
            sinon.stub(userModel, "updateUserProfile").resolves();

            const req = { user: { id: 1 }, body: { password: "123" } };
            const res = mockRes();
            const next = sinon.stub();

            await authController.updateProfile(req, res, next);

            expect(res.statusCode).to.equal(400);
        });

        it("updates name and password successfully", async () => {
            sinon.stub(userModel, "findUserById")
                .onFirstCall().resolves({ id: 1, name: "Old", profile_picture: null })
                .onSecondCall().resolves({ id: 1, name: "New", email: "a@a.com", profile_picture: null });
            sinon.stub(userModel, "updateUserProfile").resolves();
            sinon.stub(bcrypt, "hash").resolves("newhash");
            sinon.stub(userModel, "updatePassword").resolves();

            const req = { user: { id: 1 }, body: { name: "New", password: "password123" } };
            const res = mockRes();
            const next = sinon.stub();

            await authController.updateProfile(req, res, next);

            expect(res.statusCode).to.equal(200);
            expect(res.body.data.name).to.equal("New");
        });

        it("calls next(error) when findUserById throws", async () => {
            sinon.stub(userModel, "findUserById").rejects(new Error("DB down"));

            const req = { user: { id: 1 }, body: {} };
            const res = mockRes();
            const next = sinon.stub();

            await authController.updateProfile(req, res, next);

            expect(next.called).to.equal(true);
        });
    });
});

    describe("login - fallback lookup branch", () => {
        it("uses the fallback lookup when the lowercase/trimmed lookup finds nothing", async () => {
            const findStub = sinon.stub(userModel, "findUserByEmail");
            findStub.onFirstCall().resolves(null);
            findStub.onSecondCall().resolves({ id: 1, password: "hashedpw", email: "Mixed@Example.com" });

            sinon.stub(bcrypt, "compare").resolves(true);
            sinon.stub(jwt, "sign").returns("faketoken");

            const req = { body: { email: "  Mixed@Example.com  ", password: "password123" } };
            const res = mockRes();
            const next = sinon.stub();

            await authController.login(req, res, next);

            expect(findStub.calledTwice).to.equal(true);
            expect(res.statusCode).to.equal(200);
        });
    });