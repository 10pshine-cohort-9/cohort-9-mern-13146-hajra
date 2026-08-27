const pool = require("../src/config/db");

exports.mochaHooks = {
  // Clear test users once before starting the test suite (optional, ensures clean slate)
  beforeAll: async function () {
    try {
      await pool.query(
        "DELETE FROM users WHERE email LIKE '%test_%@example.com%' OR email LIKE '%note_test_%' OR email LIKE '%not-an-email%'"
      );
    } catch (err) {
      console.error("Initial database cleanup failed:", err);
    }
  },

  // Clear test users and close pool completely ONLY after ALL tests are finished
  afterAll: async function () {
    try {
      await pool.query(
        "DELETE FROM users WHERE email LIKE '%test_%@example.com%' OR email LIKE '%note_test_%' OR email LIKE '%not-an-email%'"
      );
      if (pool && pool.end) {
        await pool.end();
      }
    } catch (err) {
      console.error("Final database cleanup/pool closure failed:", err);
    }
  }
};