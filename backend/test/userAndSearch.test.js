const request = require("supertest");
const { expect } = require("chai");
const app = require("../app");
const pool = require("../src/config/db");

describe("User Profile & Note Search API", () => {
    let token;
    let userId;

    before(async () => {
        // Clear isolated test records
        await pool.execute("DELETE FROM notes");
        await pool.execute("DELETE FROM users WHERE email = 'pr5test@example.com'");

        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "PR5 User",
                email: "pr5test@example.com",
                password: "Password123!"
            });

        token = res.body.data.token;
        // Check if user object is nested or direct
        userId = res.body.data.user ? res.body.data.user.id : res.body.data.id;
    });

    it("GET /api/user/profile - should fetch profile details without password", async () => {
        const res = await request(app)
            .get("/api/user/profile")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).to.equal(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data).to.have.property("email", "pr5test@example.com");
        expect(res.body.data).to.not.have.property("password");
    });

    it("PUT /api/user/profile - should update user profile name", async () => {
        const res = await request(app)
            .put("/api/user/profile")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Updated PR5 User" });

        expect(res.status).to.equal(200);
        expect(res.body.data.name).to.equal("Updated PR5 User");
    });

    it("PUT /api/user/change-password - should change user password with valid current password", async () => {
        const res = await request(app)
            .put("/api/user/change-password")
            .set("Authorization", `Bearer ${token}`)
            .send({
                currentPassword: "Password123!",
                newPassword: "NewPassword123!"
            });

        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal("Password changed successfully");
    });

 describe("Advanced Notes Search, Filter & Sort API", () => {
        before(async () => {
            // Seed multi-case notes directly into DB for reliable sort & filter tests
            await pool.execute(
                `INSERT INTO notes (user_id, title, content, is_pinned, is_archived, created_at, updated_at)
                 VALUES 
                 (${userId}, 'Alpha Meeting Notes', 'Discussing Q1 goals', 1, 0, '2026-01-01 10:00:00', '2026-01-01 10:00:00'),
                 (${userId}, 'Zebra Shopping List', 'Buy groceries and milk', 0, 0, '2026-01-02 10:00:00', '2026-01-02 10:00:00'),
                 (${userId}, 'Beta Archived Note', 'Old project ideas', 0, 1, '2026-01-03 10:00:00', '2026-01-03 10:00:00')`
            );
        });

        it("GET /api/notes/search?q=Meeting - should search notes matching query string", async () => {
            const res = await request(app)
                .get("/api/notes/search?q=Meeting")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.be.an("array");
            expect(res.body.data.length).to.equal(1);
            expect(res.body.data[0].title).to.include("Meeting");
        });

        it("GET /api/notes/search?pinned=true&archived=false - should filter by pinned state", async () => {
            const res = await request(app)
                .get("/api/notes/search?pinned=true&archived=false")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an("array");
            expect(res.body.data.every(n => Boolean(n.is_pinned) === true && Boolean(n.is_archived) === false)).to.be.true;
        });

        it("GET /api/notes/search?sort=title_asc - should sort notes alphabetically (A-Z)", async () => {
            const res = await request(app)
                .get("/api/notes/search?sort=title_asc")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.data[0].title).to.equal("Alpha Meeting Notes");
        });

        it("GET /api/notes/search?sort=title_desc - should sort notes reverse-alphabetically (Z-A)", async () => {
            const res = await request(app)
                .get("/api/notes/search?sort=title_desc")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.data[0].title).to.equal("Zebra Shopping List");
        });

        it("GET /api/notes/search?sort=oldest - should sort notes from oldest to newest", async () => {
            const res = await request(app)
                .get("/api/notes/search?sort=oldest")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.data[0].title).to.equal("Alpha Meeting Notes");
        });
    });
});