process.env.NODE_ENV = "test";
const { expect } = require("chai");
const sinon = require("sinon");
const userModel = require("../src/models/userModel");
const pool = require("../src/config/db");
const logger = require("../src/logger/logger");

describe("userModel - unit tests (uncovered branches)", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("createUser logs and rethrows when the DB insert fails", async () => {
        sinon.stub(pool, "execute").rejects(new Error("DB insert failure"));
        const loggerSpy = sinon.stub(logger, "error");

        try {
            await userModel.createUser({ name: "Test", email: "test@example.com", password: "hash" });
            throw new Error("Expected createUser to throw");
        } catch (error) {
            expect(error.message).to.equal("DB insert failure");
        }

        expect(loggerSpy.calledOnce).to.equal(true);
        expect(loggerSpy.firstCall.args[0]).to.include("Error in createUser");
    });

    it("findUserByEmail logs and rethrows when the DB query fails", async () => {
        sinon.stub(pool, "execute").rejects(new Error("DB query failure"));
        const loggerSpy = sinon.stub(logger, "error");

        try {
            await userModel.findUserByEmail("test@example.com");
            throw new Error("Expected findUserByEmail to throw");
        } catch (error) {
            expect(error.message).to.equal("DB query failure");
        }

        expect(loggerSpy.calledOnce).to.equal(true);
        expect(loggerSpy.firstCall.args[0]).to.include("Error in findUserByEmail");
    });

    it("findUserById logs and rethrows when the DB query fails", async () => {
        sinon.stub(pool, "execute").rejects(new Error("DB query failure"));
        const loggerSpy = sinon.stub(logger, "error");

        try {
            await userModel.findUserById(1);
            throw new Error("Expected findUserById to throw");
        } catch (error) {
            expect(error.message).to.equal("DB query failure");
        }

        expect(loggerSpy.calledOnce).to.equal(true);
        expect(loggerSpy.firstCall.args[0]).to.include("Error in findUserById for userId 1");
    });

    it("updateUser (updateUserProfile) logs and rethrows when the DB update fails", async () => {
        sinon.stub(pool, "execute").rejects(new Error("DB update failure"));
        const loggerSpy = sinon.stub(logger, "error");

        try {
            await userModel.updateUser(1, { name: "New Name" });
            throw new Error("Expected updateUser to throw");
        } catch (error) {
            expect(error.message).to.equal("DB update failure");
        }

        expect(loggerSpy.calledOnce).to.equal(true);
        expect(loggerSpy.firstCall.args[0]).to.include("Error in updateUserProfile");
    });

    it("updatePassword (updateUserPassword) logs and rethrows when the DB update fails", async () => {
        sinon.stub(pool, "execute").rejects(new Error("DB update failure"));
        const loggerSpy = sinon.stub(logger, "error");

        try {
            await userModel.updatePassword(1, "new_hashed_password");
            throw new Error("Expected updatePassword to throw");
        } catch (error) {
            expect(error.message).to.equal("DB update failure");
        }

        expect(loggerSpy.calledOnce).to.equal(true);
        expect(loggerSpy.firstCall.args[0]).to.include("Error in updateUserPassword for userId 1");
    });

    it("deleteUser logs and rethrows when the DB delete fails", async () => {
        sinon.stub(pool, "execute").rejects(new Error("DB delete failure"));
        const loggerSpy = sinon.stub(logger, "error");

        try {
            await userModel.deleteUser(1);
            throw new Error("Expected deleteUser to throw");
        } catch (error) {
            expect(error.message).to.equal("DB delete failure");
        }

        expect(loggerSpy.calledOnce).to.equal(true);
        expect(loggerSpy.firstCall.args[0]).to.include("Error in deleteUser for userId 1");
    });
});