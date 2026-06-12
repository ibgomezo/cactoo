const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { db } = require("#core/tests/setup");
const { v4: uuidv4 } = require("uuid");

describe("Execution DB model", () => {
  let execution;

  beforeEach(async () => {
    await db.models.Execution.destroy({ where: {}, force: true });
  });

  describe("Create execution", () => {
    it("should fail if uuid is not unique", async () => {
      const uuid = uuidv4();
      const start = new Date();
      const end = new Date();

      await db.models.Execution.create({ uuid, type: "replicator", nodeId: 1, resources: {}, quantity: 0, start, end, delay: 0 });

      await assert.rejects(
        () => db.models.Execution.create({ uuid, type: "replicator", nodeId: 2, resources: {}, quantity: 0, start, end, delay: 0 }),
        (err) => {
          assert.strictEqual(err.name, "SequelizeUniqueConstraintError");
          return true;
        }
      );
    });
  });

  describe("errorsArray field", () => {
    it("should accept errorsArray field with multiple errors", async () => {
      const errorsArray = ["Error 1", "Error 2", "Error 3", "Error 4"];
      execution = await db.models.Execution.create({ uuid: uuidv4(), type: "replicator", nodeId: 1, resources: {}, quantity: 0, start: new Date(), end: new Date(), delay: 0, errorsArray });
      assert.deepStrictEqual(execution.errorsArray, errorsArray);
      assert.strictEqual(execution.errorsCount, 4);
    });

    it("should handle errorsArray with strings up to 255 characters", async () => {
      const errorsArray = ["a".repeat(255), "Short error"];
      execution = await db.models.Execution.create({ uuid: uuidv4(), type: "replicator", nodeId: 1, resources: {}, quantity: 0, start: new Date(), end: new Date(), delay: 0, errorsArray });
      assert.deepStrictEqual(execution.errorsArray, errorsArray);
      assert.strictEqual(execution.errorsArray[0].length, 255);
      assert.strictEqual(execution.errorsCount, 2);
    });

    it("should handle empty errorsArray", async () => {
      const result = await db.models.Execution.create({ uuid: uuidv4(), type: "replicator", nodeId: 1, resources: {}, quantity: 0, start: new Date(), end: new Date(), delay: 0, errorsArray: [] });
      assert.deepStrictEqual(result.errorsArray, []);
      assert.strictEqual(result.errorsCount, 0);
    });

    it("should default to empty array if errorsArray is not provided", async () => {
      const result = await db.models.Execution.create({ uuid: uuidv4(), type: "replicator", nodeId: 1, resources: {}, quantity: 0, start: new Date(), end: new Date(), delay: 0 });
      assert.deepStrictEqual(result.errorsArray, []);
      assert.strictEqual(result.errorsCount, 0);
    });
  });

  describe("Observations field", () => {
    it("should accept observations field with exactly 511 characters", async () => {
      const observations = "b".repeat(511);
      execution = await db.models.Execution.create({ uuid: uuidv4(), type: "replicator", nodeId: 1, resources: {}, quantity: 0, start: new Date(), end: new Date(), delay: 0, observations });
      assert.strictEqual(execution.observations, observations);
      assert.strictEqual(execution.observations.length, 511);
    });

    it("should cut observations field if longer than 511 characters", async () => {
      const observations = "b".repeat(512);
      const result = await db.models.Execution.create({ uuid: uuidv4(), type: "replicator", nodeId: 1, resources: {}, quantity: 0, start: new Date(), end: new Date(), delay: 0, observations });
      assert.strictEqual(result.observations, observations.slice(0, 508) + "...");
    });
  });
});
