process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "testsecret";

const path = require("path");
const fs = require("fs");

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
                it("should return 400 when required registration fields are missing", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({ email: "missingfields@example.com", password: "password123" });

            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
        });

        it("should return 400 when password is shorter than 6 characters", async () => {
            const email = `shortpw_${Date.now()}@example.com`;
            const response = await request(app)
                .post("/api/auth/register")
                .send({ name: "Short PW", email, password: "123" });

            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
        });

        it("should return 409 when registering with an email that already exists", async () => {
            const email = `dup_register_${Date.now()}@example.com`;
            createdTestEmails.push(email);

            const first = await request(app)
                .post("/api/auth/register")
                .send({ name: "Dup User", email, password: "password123" });
            expect(first.status).to.equal(201);

            const second = await request(app)
                .post("/api/auth/register")
                .send({ name: "Dup User Again", email, password: "password123" });

            expect(second.status).to.equal(409);
            expect(second.body.success).to.equal(false);
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
                it("should return 400 when email or password is missing", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({ email: userOne.email });

            expect(response.status).to.equal(400);
            expect(response.body.success).to.equal(false);
        });

        it("should accept an object-shaped emailOrUsername field", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    emailOrUsername: { email: userOne.email },
                    password: "password123"
                });

            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
        });

        it("should return 401 when no user exists for the given email", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: `doesnotexist_${Date.now()}@example.com`,
                    password: "password123"
                });

            expect(response.status).to.equal(401);
            expect(response.body.success).to.equal(false);
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


        it("should get all notes for the authenticated user", async () => {
    const response = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${tokenOne}`);

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


it("should update a note owned by user", async () => {
    try {
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
    } catch (error) {
        console.error("Failed to update note owned by user:", error);
        throw error;
    }
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
            describe("authMiddleware - token validation", () => {
        it("should return 401 when no Authorization header is provided", async () => {
            const response = await request(app).get("/api/notes");
            expect(response.status).to.equal(401);
        });

        it("should return 401 when Authorization header does not start with Bearer", async () => {
            const response = await request(app)
                .get("/api/notes")
                .set("Authorization", "Token abc123");
            expect(response.status).to.equal(401);
        });

        it("should return 401 when Bearer token is empty", async () => {
            const response = await request(app)
                .get("/api/notes")
                .set("Authorization", "Bearer ");
            expect(response.status).to.equal(401);
        });

        it("should return 401 for a malformed or invalid token", async () => {
            const response = await request(app)
                .get("/api/notes")
                .set("Authorization", "Bearer not.a.valid.jwt.token");
            expect(response.status).to.equal(401);
        });

        it("should return 401 when a valid token has no id or userId in its payload", async () => {
            const jwt = require("jsonwebtoken");
            const tokenWithoutId = jwt.sign({ role: "user" }, "testsecret", { expiresIn: "1h" });

            const response = await request(app)
                .get("/api/notes")
                .set("Authorization", `Bearer ${tokenWithoutId}`);
            expect(response.status).to.equal(401);
        });

        it("should return 401 for an expired token", async () => {
            const jwt = require("jsonwebtoken");
            const expiredToken = jwt.sign({ id: 1 }, "testsecret", { expiresIn: "-1s" });

            const response = await request(app)
                .get("/api/notes")
                .set("Authorization", `Bearer ${expiredToken}`);
            expect(response.status).to.equal(401);
        });
    });
    });
    describe("Notes API Endpoints - Extended", () => {
        let extraNoteId;
    
        before(async () => {
            const response = await request(app)
                .post("/api/notes")
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ title: "Extended Note", content: "Extended content" });
            extraNoteId = response.body.data.id;
        });
    
        after(async () => {
            await request(app)
                .delete(`/api/notes/${extraNoteId}`)
                .set("Authorization", `Bearer ${tokenOne}`);
        });
    
        it("should return 400 when both title and content are empty on create", async () => {
            const response = await request(app)
                .post("/api/notes")
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ title: "", content: "" });
            expect(response.status).to.equal(400);
        });
    
        it("should get a single note owned by the user", async () => {
            const response = await request(app)
                .get(`/api/notes/${extraNoteId}`)
                .set("Authorization", `Bearer ${tokenOne}`);
            expect(response.status).to.equal(200);
            expect(response.body.data.id).to.equal(extraNoteId);
        });
    
        it("should return 404 when updating a note that does not exist", async () => {
            const response = await request(app)
                .put("/api/notes/9999999")
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ title: "Does not matter" });
            expect(response.status).to.equal(404);
        });
    
        it("should return 400 when update title is empty", async () => {
            const response = await request(app)
                .put(`/api/notes/${extraNoteId}`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ title: "   " });
            expect(response.status).to.equal(400);
        });
    
        it("should return 400 when update content is not a string", async () => {
            const response = await request(app)
                .put(`/api/notes/${extraNoteId}`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ content: 12345 });
            expect(response.status).to.equal(400);
        });
    
        it("should update note content successfully", async () => {
            const response = await request(app)
                .put(`/api/notes/${extraNoteId}`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ content: "Updated content" });
            expect(response.status).to.equal(200);
            expect(response.body.data.content).to.equal("Updated content");
        });
    
        it("should return 400 when is_pinned is an invalid value on update", async () => {
            const response = await request(app)
                .put(`/api/notes/${extraNoteId}`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ is_pinned: "notaboolean" });
            expect(response.status).to.equal(400);
        });
    
        it("should return 400 when is_archived is an invalid value on update", async () => {
            const response = await request(app)
                .put(`/api/notes/${extraNoteId}`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ is_archived: "notaboolean" });
            expect(response.status).to.equal(400);
        });
    
        it("should unset is_pinned using numeric 0 on update", async () => {
            const response = await request(app)
                .put(`/api/notes/${extraNoteId}`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ is_pinned: 0 });
            expect(response.status).to.equal(200);
        });
    
        it("should unset is_archived using the string false on update", async () => {
            const response = await request(app)
                .put(`/api/notes/${extraNoteId}`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ is_archived: "false" });
            expect(response.status).to.equal(200);
        });
    
        it("should return 404 when deleting a note that does not exist", async () => {
            const response = await request(app)
                .delete("/api/notes/9999999")
                .set("Authorization", `Bearer ${tokenOne}`);
            expect(response.status).to.equal(404);
        });
    
        it("should toggle pin on using a boolean true", async () => {
            const response = await request(app)
                .patch(`/api/notes/${extraNoteId}/pin`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ is_pinned: true });
            expect(response.status).to.equal(200);
        });
    
        it("should toggle pin off using a boolean false", async () => {
            const response = await request(app)
                .patch(`/api/notes/${extraNoteId}/pin`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ is_pinned: false });
            expect(response.status).to.equal(200);
        });
    
        it("should return 400 for an invalid is_pinned value on toggle pin", async () => {
            const response = await request(app)
                .patch(`/api/notes/${extraNoteId}/pin`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ is_pinned: "bad" });
            expect(response.status).to.equal(400);
        });
    
        it("should return 404 when toggling pin on a nonexistent note", async () => {
            const response = await request(app)
                .patch("/api/notes/9999999/pin")
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ is_pinned: true });
            expect(response.status).to.equal(404);
        });
    
        it("should toggle archive on a note", async () => {
            const response = await request(app)
                .patch(`/api/notes/${extraNoteId}/archive`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ is_archived: true });
            expect(response.status).to.equal(200);
        });
    
        it("should return 400 for an invalid is_archived value on toggle archive", async () => {
            const response = await request(app)
                .patch(`/api/notes/${extraNoteId}/archive`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ is_archived: "bad" });
            expect(response.status).to.equal(400);
        });
    
        it("should return 404 when toggling archive on a nonexistent note", async () => {
            const response = await request(app)
                .patch("/api/notes/9999999/archive")
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({ is_archived: true });
            expect(response.status).to.equal(404);
        });
    
        it("should get pinned notes for the user", async () => {
            const response = await request(app)
                .get("/api/notes/pinned")
                .set("Authorization", `Bearer ${tokenOne}`);
            expect(response.status).to.equal(200);
            expect(response.body.data).to.be.an("array");
        });
    
        it("should get archived notes for the user", async () => {
            const response = await request(app)
                .get("/api/notes/archived")
                .set("Authorization", `Bearer ${tokenOne}`);
            expect(response.status).to.equal(200);
            expect(response.body.data).to.be.an("array");
        });
               
        it("should toggle pin with an empty request body", async () => {
            const response = await request(app)
                .patch(`/api/notes/${extraNoteId}/pin`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({});
            expect(response.status).to.equal(200);
        });

        it("should toggle archive with an empty request body", async () => {
            const response = await request(app)
                .patch(`/api/notes/${extraNoteId}/archive`)
                .set("Authorization", `Bearer ${tokenOne}`)
                .send({});
            expect(response.status).to.equal(200);
        });

        it("should filter search results using the is_pinned alias", async () => {
            const response = await request(app)
                .get("/api/notes/search?is_pinned=true")
                .set("Authorization", `Bearer ${tokenOne}`);
            expect(response.status).to.equal(200);
        });

        it("should filter search results using the archived flag", async () => {
            const response = await request(app)
                .get("/api/notes/search?archived=true")
                .set("Authorization", `Bearer ${tokenOne}`);
            expect(response.status).to.equal(200);
        });

        it("should filter search results using the search alias", async () => {
            const response = await request(app)
                .get("/api/notes/search?search=Extended")
                .set("Authorization", `Bearer ${tokenOne}`);
            expect(response.status).to.equal(200);
        });
    });

        describe("uploadMiddleware - file upload validation", () => {
        let uploadTestToken;
        let uploadTestEmail;
        let uploadedFilePaths = [];

        before(async () => {
            uploadTestEmail = `upload_test_${Date.now()}@example.com`;
            const res = await request(app)
                .post("/api/auth/register")
                .send({ name: "Upload Tester", email: uploadTestEmail, password: "password123" });
            uploadTestToken = res.body.data.token;
        });

        after(async () => {
            for (const filePath of uploadedFilePaths) {
                try {
                    fs.unlinkSync(filePath);
                } catch (cleanupError) {
                    /* file already removed by the middleware itself, nothing further to do */
                }
            }
            await pool.execute("DELETE FROM users WHERE email = ?", [uploadTestEmail]);
        });

        it("should update the profile when no file is attached", async () => {
            const response = await request(app)
                .put("/api/auth/profile")
                .set("Authorization", `Bearer ${uploadTestToken}`)
                .send({ name: "No File Update" });

            expect(response.status).to.equal(200);
        });

        it("should accept a genuine JPEG upload", async () => {
            const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);

            const response = await request(app)
                .put("/api/auth/profile")
                .set("Authorization", `Bearer ${uploadTestToken}`)
                .attach("profile_picture", jpegBuffer, "test.jpg");

            expect(response.status).to.equal(200);
            const filename = path.basename(response.body.data.profile_picture);
            uploadedFilePaths.push(path.join(__dirname, "../src/uploads", filename));
        });

        it("should accept a genuine PNG upload", async () => {
            const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]);

            const response = await request(app)
                .put("/api/auth/profile")
                .set("Authorization", `Bearer ${uploadTestToken}`)
                .attach("profile_picture", pngBuffer, "test.png");

            expect(response.status).to.equal(200);
            const filename = path.basename(response.body.data.profile_picture);
            uploadedFilePaths.push(path.join(__dirname, "../src/uploads", filename));
        });

        it("should accept a genuine WebP upload", async () => {
            const webpBuffer = Buffer.concat([
                Buffer.from("RIFF", "ascii"),
                Buffer.from([0x24, 0x00, 0x00, 0x00]),
                Buffer.from("WEBP", "ascii")
            ]);

            const response = await request(app)
                .put("/api/auth/profile")
                .set("Authorization", `Bearer ${uploadTestToken}`)
                .attach("profile_picture", webpBuffer, "test.webp");

            expect(response.status).to.equal(200);
            const filename = path.basename(response.body.data.profile_picture);
            uploadedFilePaths.push(path.join(__dirname, "../src/uploads", filename));
        });

        it("should reject a file with a disallowed extension", async () => {
            const textBuffer = Buffer.from("just some text content");

            const response = await request(app)
                .put("/api/auth/profile")
                .set("Authorization", `Bearer ${uploadTestToken}`)
                .attach("profile_picture", textBuffer, "test.txt");

            expect(response.status).to.equal(500);
        });

        it("should reject a file with a valid extension but invalid image content", async () => {
            const fakeBuffer = Buffer.from("not a real image binary content");

            const response = await request(app)
                .put("/api/auth/profile")
                .set("Authorization", `Bearer ${uploadTestToken}`)
                .attach("profile_picture", fakeBuffer, "fake.png");

            expect(response.status).to.equal(400);
        });
    });
});


