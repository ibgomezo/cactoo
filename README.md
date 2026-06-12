# Cactoo

An opinionated Node.js/Express framework for building APIs with optional server-side rendered views. It provides a structured way to organize modules, middlewares, policies, models, and views, keeping configuration separate from application code.

## Tech Stack

- **Node.js** — Runtime
- **Express.js** — Web framework
- **PostgreSQL** — Database
- **Sequelize** — ORM
- **EJS + express-ejs-layouts** — Template engine

---

## Quick Start

```bash
npm install

cp .env-template .env
# Edit .env with your settings

npm run migrations

npm start
```

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-reload |
| `npm test` | Run test suite |
| `npm run migrations` | Run pending DB migrations |
| `npm run seeds` | Run DB seeds |

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Application port (default: 4000) |
| `DB_URL` | PostgreSQL connection string |
| `DB_URL_TEST` | PostgreSQL connection string for the test environment |
| `COOKIE_SECRET` | Session secret |

See `.env-template` for the full list.

---

## Project Structure

```
├── app.js                      # Express app setup
├── index.js                    # HTTP server entry point
├── config/                     # App configuration (managed by project leads)
│   ├── cors.js                 # CORS allowed origins per environment
│   ├── middlewares.js          # Ordered list of active middlewares
│   ├── policies.js             # Route-level access control rules
│   ├── database.js             # Database connection config
│   └── local.js                # Local overrides (not committed)
├── core/                       # Framework internals (do not modify)
│   ├── router.js               # Auto-loads module routers and view paths
│   ├── models.js               # Loads and exposes all Sequelize models
│   ├── orm.js                  # Sequelize instance
│   ├── middlewares.js          # Builds the middleware chain from config
│   ├── policies.js             # Applies policies to routes
│   ├── logger.js               # Pino logger instance
│   └── commons/
│       ├── genericCRUDController.js   # Base CRUD controller
│       └── genericCRUDRouter.js       # Base CRUD router
├── src/                        # Application code (developer territory)
│   ├── db/
│   │   ├── models/             # Sequelize model definitions
│   │   ├── migrations/         # Database migrations
│   │   └── seeds/              # Database seeds
│   ├── middlewares/            # Custom Express middlewares
│   ├── policies/               # Access control policies
│   └── modules/                # Feature modules (one folder per resource)
│       └── users/
│           ├── router.js       # Express router for /users
│           ├── views/          # EJS templates for this module
│           │   ├── list.ejs
│           │   └── show.ejs
│           └── tests/
└── views/                      # Global layout and shared templates
    ├── layout.ejs              # Main HTML layout
    └── index.ejs               # Home page
```

---

## Creating a Module

A module is a self-contained folder inside `src/modules/` that handles a resource. Modules come in two flavors:

- **Routed module** — has a `router.js`, gets mounted automatically at `/<module-name>` and exposes HTTP endpoints.
- **Service module** — has no `router.js`, acts as a shared library of business logic, utilities, or integrations that other modules import. The framework ignores it at boot time; it is invoked directly by whoever needs it.

```
src/modules/
├── users/          # routed — exposes GET /users, etc.
│   └── router.js
└── mailer/         # service — no router, used by other modules
    └── index.js
```

```js
// src/modules/mailer/index.js
async function sendWelcome(user) { /* ... */ }

module.exports = { sendWelcome };
```

```js
// src/modules/users/router.js
const { sendWelcome } = require("#modules/mailer");

router.post("/", async (req, res) => {
  const user = await db.User.create(req.body);
  await sendWelcome(user);
  res.json(user);
});
```

### Minimal routed module

```
src/modules/products/
└── router.js
```

```js
// src/modules/products/router.js
const router = require("express").Router();

router.get("/", (req, res) => {
  res.json({ products: [] });
});

module.exports = router;
```

This is automatically available at `GET /products`.

---

### Module with CRUD via GenericCRUDController

For standard database resources, use `GenericCRUDController`:

```js
// src/modules/products/router.js
const { db } = require("#core/models");
const router = require("express").Router();
const GenericCRUDController = require("../../core/commons/genericCRUDController");

const controller = new GenericCRUDController(db.Product);

router.get("/",      (req, res) => controller.findAll(req, res));
router.get("/:id",   (req, res) => controller.findById(req, res));
router.post("/",     (req, res) => controller.create(req, res));
router.patch("/:id", (req, res) => controller.update(req, res));
router.delete("/:id",(req, res) => controller.destroy(req, res));

module.exports = router;
```

`GenericCRUDController` handles DB operations and returns clean JSON (strips `password`, `createdAt`, `updatedAt`, `deletedAt`).

The `findAll` endpoint supports query filtering via `?where=<JSON>`:

```
GET /products?where={"name":"milk"}
GET /products?where={"price":{"!=":10}}
GET /products?where={"category":{"in":"[dairy,meat]"}}
```

Supported operators: `!=`, `or`, `in`, `notin`, `like`.

---

## Responding with JSON or a View

Routes can serve both HTML and JSON from the same endpoint using HTTP content negotiation. When a browser requests the URL it sends `Accept: text/html`; API clients send `Accept: application/json`.

```js
router.get("/", async (req, res) => {
  if (!req.accepts("html")) return controller.findAll(req, res);
  try {
    const products = await db.Product.findAll();
    res.render("products/views/list", { products, title: "Products" });
  } catch {
    res.sendStatus(503);
  }
});
```

### Adding views to a module

Create EJS templates inside the module's `views/` folder. Each template only defines its content — the global layout wraps it automatically.

```
src/modules/products/views/list.ejs
```

```html
<h1>Products</h1>
<ul>
  <% products.forEach(p => { %>
    <li><a href="/products/<%= p.id %>"><%= p.name %></a></li>
  <% }) %>
</ul>
```

Templates resolve from `src/modules/`, so render them with the module path:

```js
res.render("products/views/list", { products, title: "Products" });
```

### Global layout

All views automatically inherit `views/layout.ejs`. The `<%- body %>` tag is where the module content is injected. The `title` variable sets the `<title>` tag.

Edit `views/layout.ejs` to add elements shared across every page (navigation, styles, footer).

---

## Middlewares

Middlewares are Express functions placed in `src/middlewares/`. The execution order is declared in `config/middlewares.js`:

```js
// config/middlewares.js
module.exports = ["authentication", "myMiddleware"];
```

Each file must export a standard Express middleware function:

```js
// src/middlewares/myMiddleware.js
module.exports = (req, res, next) => {
  // ...
  next();
};
```

Middlewares run on every request before policies are evaluated.

---

## Policies

Policies are functions that return a **boolean** and live in `src/policies/`. They control access at the route level and are configured in `config/policies.js`.

```js
// src/policies/isAdmin.js
module.exports = (req) => req.user?.role === "administrator";
```

```js
// config/policies.js
module.exports = {
  "*": ["isAuthenticated"],       // applies to all routes
  "/products": {
    "post": ["isAdmin"],          // POST /products requires isAdmin
  },
  "/products/:id": {
    "delete": ["isAdmin"],
  },
};
```

Rules are evaluated in this order:
1. Global policies (`"*"` key at the top level)
2. Method-specific policies for the matched route (`"post"`, `"get"`, etc.)
3. Route-level wildcard (`"*"` inside the route object) — only if no method-specific rule matched

A `401` is returned if any policy returns `false`.

---

## Models

Models are Sequelize definitions placed in `src/db/models/` and automatically loaded. Access them anywhere via `#core/models`:

```js
const { db } = require("#core/models");

const users = await db.User.findAll();
```

`db.sequelize` exposes the Sequelize instance for raw queries.

### Creating a model

```js
// src/db/models/product.js
"use strict";

module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Product", {
    name:  { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT,  allowNull: false },
  }, {
    tableName: "products",
    paranoid: true,
  });
};
```

All structural changes to the database must go through migrations, never through direct model edits.

---

## Tests

Tests use Node.js built-in test runner (`node:test`) and `node:assert`. Place test files inside a `tests/` folder within the relevant area, named `*.test.js`.

```
src/modules/products/tests/products.test.js
```

```js
const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { app, db } = require("#core/tests/setup");

describe("Products", () => {
  beforeEach(async () => {
    await db.models.Product.create({ name: "Milk", price: 1.5 });
  });

  afterEach(async () => {
    await db.clearAll();
  });

  it("should return all products", async () => {
    const res = await request(app).get("/products");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.length, 1);
  });
});
```

Before tests run, `npm test` automatically executes `core/tests/pre-test.js`, which drops and re-creates the test database schema via Sequelize migrations.

The test helper exposed by `#core/tests/setup` provides:

| Export | Description |
|---|---|
| `app` | The Express app instance |
| `db.models` | All Sequelize models |
| `db.clearAll()` | Truncates all tables (only works with `NODE_ENV=test`) |

---

## Configuration Files

The `config/` folder is managed by project leads. Use `config/local.js` for local overrides — this file is gitignored and merged on top of every other config at startup.

| File | Purpose |
|---|---|
| `cors.js` | Allowed origins per environment |
| `middlewares.js` | Ordered list of active middlewares |
| `policies.js` | Route access control rules |
| `database.js` | Database connection settings |
| `local.js` | Local developer overrides (gitignored) |

### Internal module aliases

The following `#`-prefixed aliases are available everywhere in the project:

| Alias | Resolves to |
|---|---|
| `#core/models` | `core/models.js` |
| `#core/logger` | `core/logger.js` |
| `#core/commons/*` | `core/commons/*.js` |
| `#core/tests/*` | `core/tests/*.js` |
| `#modules/*` | `src/modules/*.js` |
| `#src/*` | `src/*.js` |
