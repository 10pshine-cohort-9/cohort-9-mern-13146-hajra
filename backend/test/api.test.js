process.env.NODE_ENV = "test";

const request = require("supertest");
const { expect } = require("chai");
const app = require("../app");
const pool = require("../src/config/db");

describe("API Integration Tests", () => {
    let userOne;
    let userTwo;
    let tokenOne;
    let tokenTwo;
    let noteId;
    let createdTestEmails = [];

    before(async () => {
        const password = "password123";

        // 1. Setup User One
        const emailOne = `test_user_1_${Date.now()}@example.com`;
        const regResOne = await request(app)
            .post("/api/auth/register")
            .send({ name: "User One", email: emailOne, password });

        userOne = regResOne.body.data;
        tokenOne = regResOne.body.data?.token;

        // Fallback login if token isn't returned directly on register
        if (!tokenOne) {
            const loginResOne = await request(app)
                .post("/api/auth/login")
                .send({ email: emailOne, password });
            tokenOne = loginResOne.body.data?.token;
        }

        // 2. Setup User Two
        const emailTwo = `test_user_2_${Date.now()}@example.com`;
        const regResTwo = await request(app)
            .post("/api/auth/register")
            .send({ name: "User Two", email: emailTwo, password });

        userTwo = regResTwo.body.data;
        tokenTwo = regResTwo.body.data?.token;

        if (!tokenTwo) {
            const loginResTwo = await request(app)
                .post("/api/auth/login")
                .send({ email: emailTwo, password });
            tokenTwo = loginResTwo.body.data?.token;
        }
    });

    afterEach(async () => {
        for (const email of createdTestEmails) {
            await pool.execute("DELETE FROM users WHERE email = ?", [email]);
        }
        createdTestEmails = [];
    });

    after(async () => {
        if (userOne?.email) {
            await pool.execute("DELETE FROM users WHERE email = ?", [userOne.email]);
        }
        if (userTwo?.email) {
            await pool.execute("DELETE FROM users WHERE email = ?", [userTwo.email]);
        }
    });

    describe("GET /api/health", () => {
        it("should return server healthy status", async () => {
            const response = await request(app).get("/api/health");
            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
        });
    });

    describe("POST /api/auth/register", () => {
        it("should register a new user successfully", async () => {
            const email = `new_api_user_${Date.now()}@example.com`;
            createdTestEmails.push(email);

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "New API User",
                    email,
                    password: "password123"
                });

            expect(response.status).to.equal(201);
            expect(response.body.success).to.equal(true);
        });

        it("should return 400 for invalid email format", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Invalid User",
                    email: "not-an-email",
                    password: "password123"
                });

            expect(response.status).to.equal(400);
        });
    });

    describe("POST /api/auth/login", () => {
        it("should login successfully with correct credentials", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: userOne.email,
                    password: "password123"
                });

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
            expect(response.body.data.token).to.be.a("string");
        });

        it("should return 401 for incorrect password", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: userOne.email,
                    password: "wrongpassword"
                });

            expect(response.status).to.equal(401);
        });
    });

    describe("Notes API Endpoints", () => {
        it("should create a new note for logged-in user", async () => {
            expect(tokenOne, "tokenOne must be populated").to.be.a("string");

            const response = await request(app)
                .post("/api/notes")
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({
                    title: "Test Note",
                    content: "This is a test note content."
                });

            expect(response.status).to.equal(201);
            expect(response.body.success).to.equal(true);
            expect(response.body.data.title).to.equal("Test Note");
            noteId = response.body.data.id;
        });

        // it("should get all notes for the authenticated user", async () => {
        //     const response = await request(app)
        //         .get("/api/notes")
        //         .set("Authorization", `Bearer ${tokenOne}`);

        //     expect(response.status).to.equal(200);
        //     expect(response.body.success).to.equal(true);
        //     expect(response.body.data).to.be.an("array");
        // });


        it("should get all notes for the authenticated user", async () => {
    const response = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${tokenOne}`);

    // LOG ERROR PAYLOAD IF NOT 200:
    if (response.status !== 200) {
        console.log("GET /api/notes ERROR BODY:", response.body);
    }

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data).to.be.an("array");
});

        it("should prevent User Two from accessing User One's note", async () => {
            const response = await request(app)
                .get(`/api/notes/${noteId}`)
                .set("Authorization", `Bearer ${tokenTwo}`);

            expect(response.status).to.equal(404);
        });

        // it("should update a note owned by user", async () => {
        //     const response = await request(app)
        //         .put(`/api/notes/${noteId}`)
        //         .set("Authorization", `Bearer ${tokenOne}`)
        //         .send({
        //             title: "Updated Title",
        //             is_pinned: 1
        //         });

        //     expect(response.status).to.equal(200);
        //     expect(response.body.data.title).to.equal("Updated Title");
        // });


        it("should update a note owned by user", async () => {
    const response = await request(app)
        .put(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${tokenOne}`)
        .send({
            title: "Updated Title",
            is_pinned: 1
        });

    expect(response.status).to.equal(200);
    expect(response.body.data.title).to.equal("Updated Title");
    expect(Number(response.body.data.is_pinned)).to.equal(1);
});
        it("should delete a note owned by user", async () => {
            const response = await request(app)
                .delete(`/api/notes/${noteId}`)
                .set("Authorization", `Bearer ${tokenOne}`);

            expect(response.status).to.equal(200);
        });
    });

    describe("Global Error Handling", () => {
        it("should return 500 for unhandled application error", async () => {
            const response = await request(app).get("/__test__/error");
            expect(response.status).to.equal(500);
            expect(response.body.success).to.equal(false);
        });
    });
});