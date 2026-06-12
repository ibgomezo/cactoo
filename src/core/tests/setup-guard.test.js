const { describe, it, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { db } = require("#core/tests/setup");

describe("Test environment guards", () => {
  describe("clearAll", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it("should throw when NODE_ENV is not 'test'", async () => {
      process.env.NODE_ENV = "production";
      await assert.rejects(
        () => db.clearAll(),
        (err) => {
          assert.ok(err.message.includes("clearAll() can only run with NODE_ENV=test"));
          return true;
        }
      );
    });

    it("should not throw when NODE_ENV is 'test'", async () => {
      process.env.NODE_ENV = "test";
      await assert.doesNotReject(() => db.clearAll());
    });
  });
});
