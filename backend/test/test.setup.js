const pool = require("../src/config/db");

exports.mochaHooks = {
  beforeAll: async function () {
    try {
      await pool.query(
        "DELETE FROM users WHERE email LIKE '%test_%@example.com%' OR email LIKE '%note_test_%' OR email LIKE '%not-an-email%'"
      );
    } catch (err) {
      console.error("Initial database cleanup failed:", err);
    }
  },

  afterAll: async function () {
    try {
      await pool.query(
        "DELETE FROM users WHERE email LIKE '%test_%@example.com%' OR email LIKE '%note_test_%' OR email LIKE '%not-an-email%'"
      );
      if (pool?.end) {
    await pool.end();
}
    } catch (err) {
      console.error("Final database cleanup/pool closure failed:", err);
    }
  }
};