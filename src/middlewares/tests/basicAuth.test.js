const { describe, it, beforeEach, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const { db } = require("#core/tests/setup");
const basicAuth = require("../basicAuth.js");
const crypto = require("crypto");

describe("basicAuth Middleware", () => {
  beforeEach(async () => {
    const salt = crypto.randomBytes(8).toString("base64");
    const derivedKey = crypto.scryptSync("password", salt, 128);
    await db.models.User.create({
      id: 1,
      name: "Test User",
      email: "user@test.com",
      password: `${salt}:${derivedKey.toString("base64")}`,
      role: "administrator"
    });
  });

  afterEach(async () => {
    mock.restoreAll();
    await db.clearAll();
  });

  it("Should allow if the credentials are valid", async () => {
    // base64("user@test.com:password")
    const req = { headers: { authorization: "Basic dXNlckB0ZXN0LmNvbTpwYXNzd29yZA==" } };
    const res = {};
    const next = mock.fn();

    await basicAuth(req, res, next);

    assert.strictEqual(req.user.id, 1);
    assert.strictEqual(req.user.name, "Test User");
    assert.strictEqual(next.mock.calls.length, 1);
  });

  it("Should reject if the credentials are invalid", async () => {
    const req = { headers: { authorization: "Basic invalid-token" } };
    const sendStub = mock.fn();
    const statusStub = mock.fn(() => ({ send: sendStub }));
    const next = mock.fn();

    await basicAuth(req, { status: statusStub }, next);

    assert.strictEqual(statusStub.mock.calls[0].arguments[0], 401);
    assert.strictEqual(next.mock.calls.length, 0);
    assert.strictEqual(sendStub.mock.calls[0].arguments[0], "Unauthorized");
  });

  it("Should reject if the Authorization header is not present", async () => {
    const req = { headers: {} };
    const sendStub = mock.fn();
    const setStub = mock.fn(() => ({ send: sendStub }));
    const statusStub = mock.fn(() => ({ set: setStub }));
    const next = mock.fn();

    await basicAuth(req, { status: statusStub }, next);

    assert.strictEqual(statusStub.mock.calls[0].arguments[0], 401);
    assert.strictEqual(next.mock.calls.length, 0);
    assert.strictEqual(setStub.mock.calls[0].arguments[0], "WWW-Authenticate");
    assert.strictEqual(setStub.mock.calls[0].arguments[1], "Basic realm=\"Restricted Area\"");
    assert.strictEqual(sendStub.mock.calls[0].arguments[0], "Authorization header required.");
  });
});
