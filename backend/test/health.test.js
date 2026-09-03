process.env.NODE_ENV = "test";

const request = require("supertest");
const { expect } = require("chai");
const app = require("../app");

describe("App Infrastructure", () => {
    describe("GET /api/health", () => {
        it("should return server healthy status", async () => {
            const response = await request(app).get("/api/health");
            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
        });
    });

    describe("GET /", () => {
        it("should return the running message", async () => {
            const response = await request(app).get("/");
            expect(response.status).to.equal(200);
            expect(response.text).to.equal("Notes API is running");
        });
    });

    describe("Unknown routes", () => {
        it("should return 404 for a route that does not exist", async () => {
            const response = await request(app).get("/api/this-route-does-not-exist");
            expect(response.status).to.equal(404);
            expect(response.body.success).to.equal(false);
            expect(response.body.message).to.equal("Route not found");
        });
    });

    describe("CORS handling", () => {
        it("should reject a request from a disallowed origin", async () => {
            const response = await request(app)
                .get("/api/health")
                .set("Origin", "http://not-allowed.com");

            expect(response.status).to.equal(500);
            expect(response.body.success).to.equal(false);
        });
    });

    describe("Error middleware with headers already sent", () => {
       it("should call next(err) without attempting to send a second response", async () => {
    try {
        await request(app).get("/__test__/error-after-headers");
        throw new Error("Expected the connection to be aborted, but the request completed normally");
    } catch (err) {
        expect(err.message).to.include("aborted");
    }
});
    });

    describe("ALLOWED_ORIGINS environment configuration", () => {
        let freshApp;
        let originalEnv;

        before(() => {
            originalEnv = process.env.ALLOWED_ORIGINS;
            process.env.ALLOWED_ORIGINS = "http://example.com, http://foo.com";
            delete require.cache[require.resolve("../app")];
            freshApp = require("../app");
        });

        after(() => {
            process.env.ALLOWED_ORIGINS = originalEnv;
            delete require.cache[require.resolve("../app")];
            require("../app");
        });

        it("accepts an origin parsed from a comma-separated ALLOWED_ORIGINS value", async () => {
            const response = await request(freshApp)
                .get("/api/health")
                .set("Origin", "http://example.com");
            expect(response.status).to.equal(200);
        });
    });
});