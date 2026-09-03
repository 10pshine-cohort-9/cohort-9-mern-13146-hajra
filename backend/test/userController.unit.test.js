process.env.NODE_ENV = "test";
const { expect } = require("chai");
const sinon = require("sinon");
const userController = require("../src/controllers/userController");
const userModel = require("../src/models/userModel");
const bcrypt = require("bcryptjs");
const mockRes = require("./helpers/mockRes");
const withFallback = require("./helpers/withFallback");
describe("userController - unit tests (uncovered branches)", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("getUserProfile returns 404 when user is not found", async () => {
        sinon.stub(userModel, "findUserById").resolves(null);

        const req = { user: { id: 1 } };
        const res = mockRes();
        const next = sinon.stub();

        await userController.getUserProfile(req, res, next);

        expect(res.statusCode).to.equal(404);
    });

    it("getUserProfile calls next(error) when the model throws", async () => {
        sinon.stub(userModel, "findUserById").rejects(new Error("DB failure"));

        const req = { user: { id: 1 } };
        const res = mockRes();
        const next = sinon.stub();

        await userController.getUserProfile(req, res, next);

        expect(next.called).to.equal(true);
    });

    it("updateUserProfile calls next(error) when the model throws", async () => {
        sinon.stub(userModel, "updateUserProfile").rejects(new Error("DB failure"));

        const req = { user: { id: 1 }, body: { name: "Valid Name" } };
        const res = mockRes();
        const next = sinon.stub();

        await userController.updateUserProfile(req, res, next);

        expect(next.called).to.equal(true);
    });

    it("changePassword returns 400 when required fields are missing", async () => {
        const req = { user: { id: 1 }, body: { currentPassword: "abc123" } };
        const res = mockRes();
        const next = sinon.stub();

        await userController.changePassword(req, res, next);

        expect(res.statusCode).to.equal(400);
    });

    it("changePassword returns 400 when newPassword is too short", async () => {
        const req = { user: { id: 1 }, body: { currentPassword: "abc123", newPassword: "123" } };
        const res = mockRes();
        const next = sinon.stub();

        await userController.changePassword(req, res, next);

        expect(res.statusCode).to.equal(400);
    });

    it("changePassword returns 404 when user is not found", async () => {
        sinon.stub(userModel, "findUserById").resolves(null);

        const req = { user: { id: 1 }, body: { currentPassword: "abc123", newPassword: "newpass123" } };
        const res = mockRes();
        const next = sinon.stub();

        await userController.changePassword(req, res, next);

        expect(res.statusCode).to.equal(404);
    });

    it("changePassword returns 400 when current password is incorrect", async () => {
        sinon.stub(userModel, "findUserById").resolves({ id: 1, password: "hashedpw" });
        sinon.stub(bcrypt, "compare").resolves(false);

        const req = { user: { id: 1 }, body: { currentPassword: "wrongpass", newPassword: "newpass123" } };
        const res = mockRes();
        const next = sinon.stub();

        await userController.changePassword(req, res, next);

        expect(res.statusCode).to.equal(400);
    });

    it("changePassword calls next(error) when the model throws", async () => {
        sinon.stub(userModel, "findUserById").rejects(new Error("DB failure"));

        const req = { user: { id: 1 }, body: { currentPassword: "abc123", newPassword: "newpass123" } };
        const res = mockRes();
        const next = sinon.stub();

        await userController.changePassword(req, res, next);

        expect(next.called).to.equal(true);
    });
        it("getUserProfile falls back to user_id when id is absent from req.user", async () => {
        sinon.stub(userModel, "findUserById").resolves({ id: 1, password: "x" });

        const req = { user: { user_id: 1 } };
        const res = mockRes();
        const next = sinon.stub();

        await userController.getUserProfile(req, res, next);

        expect(res.statusCode).to.equal(200);
    });

   

    it("updateUserProfile falls back to user_id and handles a missing req.body", async () => {
        sinon.stub(userModel, "updateUserProfile").resolves();
        sinon.stub(userModel, "findUserById").resolves({ id: 1, name: "Test" });

        const req = { user: { user_id: 1 } };
        const res = mockRes();
        const next = sinon.stub();

        await userController.updateUserProfile(req, res, next);

        expect(res.statusCode).to.equal(200);
    });

    it("updateUserProfile builds the profile picture path when a file is uploaded", async () => {
        sinon.stub(userModel, "updateUserProfile").resolves();
        sinon.stub(userModel, "findUserById").resolves({ id: 1, name: "Test", profile_picture: "/uploads/pic.png" });

        const req = { user: { id: 1 }, body: {}, file: { filename: "pic.png" } };
        const res = mockRes();
        const next = sinon.stub();

        await userController.updateUserProfile(req, res, next);

        expect(res.statusCode).to.equal(200);
        expect(res.body.data.profile_picture).to.equal("/uploads/pic.png");
    });


    it("changePassword falls back to user_id and handles a missing req.body", async () => {
        const req = { user: { user_id: 1 } };
        const res = mockRes();
        const next = sinon.stub();

        await userController.changePassword(req, res, next);

        expect(res.statusCode).to.equal(400);
    });

    it("changePassword accepts oldPassword when currentPassword is absent", async () => {
        sinon.stub(userModel, "findUserById").resolves({ id: 1, password: "hashedpw" });
        sinon.stub(bcrypt, "compare").resolves(true);
        sinon.stub(userModel, "updateUserPassword").resolves();

        const req = { user: { id: 1 }, body: { oldPassword: "abc123", newPassword: "newpass123" } };
        const res = mockRes();
        const next = sinon.stub();

        await userController.changePassword(req, res, next);

        expect(res.statusCode).to.equal(200);
    });

  
        it("getUserProfile falls back to getUserById when findUserById is absent", async () => {
        await withFallback(userModel, "findUserById", "getUserById", sinon.stub().resolves({ id: 1, password: "x" }), async () => {
            const req = { user: { id: 1 } };
            const res = mockRes();
            const next = sinon.stub();

            await userController.getUserProfile(req, res, next);

            expect(res.statusCode).to.equal(200);
        });
    });

    it("updateUserProfile falls back to getUserById when findUserById is absent", async () => {
        sinon.stub(userModel, "updateUserProfile").resolves();

        await withFallback(userModel, "findUserById", "getUserById", sinon.stub().resolves({ id: 1, name: "Test" }), async () => {
            const req = { user: { id: 1 }, body: {} };
            const res = mockRes();
            const next = sinon.stub();

            await userController.updateUserProfile(req, res, next);

            expect(res.statusCode).to.equal(200);
        });
    });

    it("changePassword falls back to getUserById when findUserById is absent", async () => {
        sinon.stub(bcrypt, "compare").resolves(true);
        sinon.stub(userModel, "updateUserPassword").resolves();

        await withFallback(userModel, "findUserById", "getUserById", sinon.stub().resolves({ id: 1, password: "hashedpw" }), async () => {
            const req = { user: { id: 1 }, body: { currentPassword: "abc123", newPassword: "newpass123" } };
            const res = mockRes();
            const next = sinon.stub();

            await userController.changePassword(req, res, next);

            expect(res.statusCode).to.equal(200);
        });
    });

    it("changePassword falls back to updatePassword when updateUserPassword is absent", async () => {
        sinon.stub(userModel, "findUserById").resolves({ id: 1, password: "hashedpw" });
        sinon.stub(bcrypt, "compare").resolves(true);

        await withFallback(userModel, "updateUserPassword", "updatePassword", sinon.stub().resolves(), async () => {
            const req = { user: { id: 1 }, body: { currentPassword: "abc123", newPassword: "newpass123" } };
            const res = mockRes();
            const next = sinon.stub();

            await userController.changePassword(req, res, next);

            expect(res.statusCode).to.equal(200);
        });
    });
        it("updateUserProfile falls back to an empty object when the refetch returns nothing", async () => {
        sinon.stub(userModel, "updateUserProfile").resolves();
        sinon.stub(userModel, "findUserById").resolves(null);

        const req = { user: { id: 1 }, body: { name: "Valid Name" } };
        const res = mockRes();
        const next = sinon.stub();

        await userController.updateUserProfile(req, res, next);

        expect(res.statusCode).to.equal(200);
        expect(res.body.data).to.deep.equal({});
    });

    it("changePassword rejects when the stored user has no password field", async () => {
        sinon.stub(userModel, "findUserById").resolves({ id: 1 });
        sinon.stub(bcrypt, "compare").resolves(false);

        const req = { user: { id: 1 }, body: { currentPassword: "abc123", newPassword: "newpass123" } };
        const res = mockRes();
        const next = sinon.stub();

        await userController.changePassword(req, res, next);

        expect(res.statusCode).to.equal(400);
    });
});