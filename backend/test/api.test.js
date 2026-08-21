process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
// ... rest of your test code
const { expect } = require("chai");
const bcrypt = require("bcryptjs");

const pool = require("../src/config/db");
const userModel = require("../src/models/userModel");

describe("Authentication and Notes API", () => {
    let userOne;
    let userTwo;
    let tokenOne;
    let tokenTwo;
    let noteId;

    const userOneEmail = `api_user_one_${Date.now()}@example.com`;
    const userTwoEmail = `api_user_two_${Date.now()}@example.com`;

    const password = "TestPassword123";

    before(async () => {
        const hashedPassword = await bcrypt.hash(password, 10);

        const userOneId = await userModel.createUser({
            name: "API Test User One",
            email: userOneEmail,
            password: hashedPassword,
            profile_picture: null
        });

        const userTwoId = await userModel.createUser({
            name: "API Test User Two",
            email: userTwoEmail,
            password: hashedPassword,
            profile_picture: null
        });

        userOne = {
            id: userOneId,
            email: userOneEmail
        };

        userTwo = {
            id: userTwoId,
            email: userTwoEmail
        };
    });

    after(async () => {
    if (userOne?.id) {
        await pool.execute(
            "DELETE FROM users WHERE id = ?",
            [userOne.id]
        );
    }

    if (userTwo?.id) {
        await pool.execute(
            "DELETE FROM users WHERE id = ?",
            [userTwo.id]
        );
    }
});

    describe("Authentication", () => {
        it("should reject registration with missing fields", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Incomplete User"
                });

            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
        });

        it("should reject registration with an already registered email", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Duplicate User",
                    email: userOneEmail,
                    password
                });

            expect(response.status).to.equal(409);
            expect(response.body.success).to.equal(false);
        });

        it("should register a new user successfully", async () => {
            const email = `new_api_user_${Date.now()}@example.com`;

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "New API User",
                    email,
                    password
                });

            expect(response.status).to.equal(201);
            expect(response.body.success).to.equal(true);
            expect(response.body.data.email).to.equal(email);

            await pool.execute(
                "DELETE FROM users WHERE email = ?",
                [email]
            );
        });

        it("should reject login with invalid credentials", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: userOneEmail,
                    password: "WrongPassword123"
                });

            expect(response.status).to.equal(401);
            expect(response.body.success).to.equal(false);
        });

        it("should login successfully and return a JWT", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: userOneEmail,
                    password
                });

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.data.token).to.be.a("string");

            tokenOne = response.body.data.token;
        });

        it("should login the second user successfully", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: userTwoEmail,
                    password
                });

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.data.token).to.be.a("string");

            tokenTwo = response.body.data.token;
        });
    });

    describe("Notes Authorization", () => {
        it("should reject access to notes without a token", async () => {
            const response = await request(app)
                .get("/api/notes");

            expect(response.status).to.equal(401);
            expect(response.body.success).to.equal(false);
        });

        it("should reject an invalid token", async () => {
            const response = await request(app)
                .get("/api/notes")
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).to.equal(401);
            expect(response.body.success).to.equal(false);
        });
    });

    describe("Global Error Handling", () => {
        it("should return 500 for an unhandled application error", async () => {
            const response = await request(app)
                .get("/__test__/error");

            expect(response.status).to.equal(500);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal("Internal server error");
            expect(response.body).to.not.have.property("stack");
            expect(response.body).to.not.have.property("error");
        });
    });

    describe("Note CRUD", () => {
        it("should create a note for the authenticated user", async () => {
            const response = await request(app)
                .post("/api/notes")
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({
                    title: "API Test Note",
                    content: "This note was created through the API."
                });

            expect(response.status).to.equal(201);
            expect(response.body.success).to.equal(true);
            expect(response.body.data.id).to.be.a("number");

            noteId = response.body.data.id;
        });

        it("should get only the authenticated user's notes", async () => {
            const response = await request(app)
                .get("/api/notes")
                .set("Authorization", `Bearer ${tokenOne}`);

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.data).to.be.an("array");

            response.body.data.forEach((note) => {
                expect(note.user_id).to.equal(userOne.id);
            });
        });

        it("should get a note by ID for the authenticated user", async () => {
            const response = await request(app)
                .get(`/api/notes/${noteId}`)
                .set("Authorization", `Bearer ${tokenOne}`);

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.data.id).to.equal(noteId);
            expect(response.body.data.user_id).to.equal(userOne.id);
        });

        it("should not allow another user to access the note", async () => {
            const response = await request(app)
                .get(`/api/notes/${noteId}`)
                .set("Authorization", `Bearer ${tokenTwo}`);

            expect(response.status).to.equal(404);
            expect(response.body.success).to.equal(false);
        });

        it("should update the authenticated user's note", async () => {
            const response = await request(app)
                .put(`/api/notes/${noteId}`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({
                    title: "Updated API Test Note",
                    content: "Updated note content."
                });

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
        });

        it("should not allow another user to update the note", async () => {
            const response = await request(app)
                .put(`/api/notes/${noteId}`)
                .set("Authorization", `Bearer ${tokenTwo}`)
                .send({
                    title: "Unauthorized Update",
                    content: "This should not be allowed."
                });

            expect(response.status).to.equal(404);
            expect(response.body.success).to.equal(false);
        });

        it("should pin the authenticated user's note", async () => {
            const response = await request(app)
                .patch(`/api/notes/${noteId}/pin`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({
                    isPinned: true
                });

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
        });

        it("should get pinned notes for the authenticated user", async () => {
            const response = await request(app)
                .get("/api/notes/pinned")
                .set("Authorization", `Bearer ${tokenOne}`);

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.data).to.be.an("array");
        });

        it("should archive the authenticated user's note", async () => {
            const response = await request(app)
                .patch(`/api/notes/${noteId}/archive`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({
                    isArchived: true
                });

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
        });

        it("should get archived notes for the authenticated user", async () => {
            const response = await request(app)
                .get("/api/notes/archived")
                .set("Authorization", `Bearer ${tokenOne}`);

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.data).to.be.an("array");
        });

        it("should delete the authenticated user's note", async () => {
            const response = await request(app)
                .delete(`/api/notes/${noteId}`)
                .set("Authorization", `Bearer ${tokenOne}`);

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
        });

        it("should return 404 when requesting a deleted note", async () => {
            const response = await request(app)
                .get(`/api/notes/${noteId}`)
                .set("Authorization", `Bearer ${tokenOne}`);

            expect(response.status).to.equal(404);
            expect(response.body.success).to.equal(false);
        });
    });
});