/*
 * EXAMPLE TEST — DB model with advanced field constraints
 *
 * Shows how to test unique constraints, array fields, and string truncation
 * at the database level using the built-in test runner.
 *
const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { db } = require("#core/tests/setup");

describe("Execution DB model", () => {
  let execution;

  beforeEach(async () => {
    await db.models.Execution.destroy({ where: {}, force: true });
  });

  describe("Create execution", () => {
    it("should fail if uuid is not unique", async () => {
      const uuid = "some-unique-id";

      await db.models.Execution.create({ uuid, ...fields });

      await assert.rejects(
        () => db.models.Execution.create({ uuid, ...otherFields }),
        (err) => {
          assert.strictEqual(err.name, "SequelizeUniqueConstraintError");
          return true;
        }
      );
    });
  });

  describe("Array field", () => {
    it("should store and retrieve an array", async () => {
      const items = ["a", "b", "c"];
      execution = await db.models.Execution.create({ items });
      assert.deepStrictEqual(execution.items, items);
    });
  });

  describe("String field with max length", () => {
    it("should truncate strings longer than the limit", async () => {
      const long = "x".repeat(512);
      const result = await db.models.Execution.create({ notes: long });
      assert.strictEqual(result.notes, long.slice(0, 508) + "...");
    });
  });
});
*/
