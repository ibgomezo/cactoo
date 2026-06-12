const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { app, db } = require("#core/tests/setup");

describe("Users", () => {
  beforeEach(async () => {
    await db.models.User.create({
      name: "Ana García",
      email: "ana@test.com",
      password: "hashed_password",
      role: "administrator"
    });
    await db.models.User.create({
      name: "Luis Pérez",
      email: "luis@test.com",
      password: "hashed_password",
      role: "viewer"
    });
  });

  afterEach(async () => {
    await db.clearAll();
  });

  describe("GET /users", () => {
    it("should return all users", async () => {
      const res = await request(app).get("/users");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.length, 2);
      assert.ok(res.body.every(u => !u.password));
    });
  });

  describe("GET /users/:id", () => {
    it("should return a user by id", async () => {
      const all = await request(app).get("/users");
      const id = all.body[0].id;

      const res = await request(app).get(`/users/${id}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.id, id);
      assert.ok(!res.body.password);
    });

    it("should return 404 for a non-existent user", async () => {
      const res = await request(app).get("/users/999999");
      assert.strictEqual(res.status, 404);
    });
  });
});
