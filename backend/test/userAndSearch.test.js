process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "testsecret";

const request = require("supertest");
const { expect } = require("chai");
const app = require("../app");
const pool = require("../src/config/db");

describe("User & Note Search API Endpoints", () => {
    let token;
    let userId;

    before(async () => {
        await pool.execute(
            `DELETE FROM notes WHERE user_id IN (SELECT id FROM users WHERE email = 'pr5test@example.com')`
        );
        await pool.execute("DELETE FROM users WHERE email = 'pr5test@example.com'");

        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "PR5 User",
                email: "pr5test@example.com",
                password: "Password123!"
            });

        expect(res.status).to.equal(201);
        token = res.body.data.token;
        userId = res.body.data.user ? res.body.data.user.id : res.body.data.id;

        expect(token).to.exist;
        expect(userId).to.exist;

        await pool.execute(
            `INSERT INTO notes (user_id, title, content, is_pinned, is_archived, created_at, updated_at) 
             VALUES 
             (?, 'Alpha Meeting Notes', 'Discussing Q1 goals', 1, 0, '2026-01-01 10:00:00', '2026-01-01 10:00:00'),
             (?, 'Zebra Shopping List', 'Buy groceries and milk', 0, 0, '2026-01-02 10:00:00', '2026-01-02 10:00:00'),
             (?, 'Beta Archived Note', 'Old project ideas', 0, 1, '2026-01-03 10:00:00', '2026-01-03 10:00:00')`,
            [userId, userId, userId]
        );
    });

    after(async () => {
        if (userId) {
            await pool.execute("DELETE FROM notes WHERE user_id = ?", [userId]);
            await pool.execute("DELETE FROM users WHERE id = ?", [userId]);
        }
    });

    describe("GET /api/users/profile", () => {
        it("should retrieve the authenticated user profile", async () => {
            const res = await request(app)
                .get("/api/users/profile")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.email).to.equal("pr5test@example.com");
            expect(res.body.data).to.not.have.property("password");
        });
    });

    describe("PUT /api/users/profile", () => {
        it("should update user profile details", async () => {
            const res = await request(app)
                .put("/api/users/profile")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "Updated PR5 User",
                    profile_picture: "https://example.com/avatar.png"
                });

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.name).to.equal("Updated PR5 User");
        });
                it("should return 400 when updating profile with an empty name", async () => {
            const res = await request(app)
                .put("/api/users/profile")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "   " });
            expect(res.status).to.equal(400);
        });

        it("should return 400 when updating profile with a short password", async () => {
            const res = await request(app)
                .put("/api/users/profile")
                .set("Authorization", `Bearer ${token}`)
                .send({ password: "123" });
            expect(res.status).to.equal(400);
        });
    });

    describe("PUT /api/users/change-password", () => {
        it("should change user password given correct current password", async () => {
            const res = await request(app)
                .put("/api/users/change-password")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    currentPassword: "Password123!",
                    newPassword: "NewPassword123!"
                });

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

        describe("PUT /api/users/profile - password update", () => {
        it("should update the profile password successfully", async () => {
            const res = await request(app)
                .put("/api/users/profile")
                .set("Authorization", `Bearer ${token}`)
                .send({ password: "FinalPassword123!" });

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    describe("GET /api/notes/search", () => {
        it("should filter notes by search query", async () => {
            const res = await request(app)
                .get("/api/notes/search?q=Meeting")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.have.lengthOf(1);
            expect(res.body.data[0].title).to.equal("Alpha Meeting Notes");
        });

        it("should filter notes by pinned status", async () => {
            const res = await request(app)
                .get("/api/notes/search?pinned=true")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.have.lengthOf(1);
            expect(res.body.data[0].title).to.equal("Alpha Meeting Notes");
        });

        it("should sort notes by title asc", async () => {
            const res = await request(app)
                .get("/api/notes/search?sort=title_asc")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data[0].title).to.equal("Alpha Meeting Notes");
        });
        it("should filter notes by unpinned status", async () => {
    const res = await request(app)
        .get("/api/notes/search?pinned=false")
        .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data).to.have.lengthOf(2);
});

it("should filter notes by archived status", async () => {
    const res = await request(app)
        .get("/api/notes/search?archived=true")
        .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data).to.have.lengthOf(1);
    expect(res.body.data[0].title).to.equal("Beta Archived Note");
});

it("should filter notes by unarchived status", async () => {
    const res = await request(app)
        .get("/api/notes/search?archived=false")
        .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data).to.have.lengthOf(2);
});
    });
    
});