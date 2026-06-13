/*
 * EXAMPLE MODULE — users
 *
 * This file is auto-mounted at GET /users by the framework.
 * Rename the parent folder to change the route prefix.
 *
const { db } = require("#core/models");
const router = require("express").Router();
const GenericCRUDController = require("../../../core/commons/genericCRUDController");

const controller = new GenericCRUDController(db.User);

// JSON + HTML content negotiation
router.get("/", async (req, res) => {
  if (!req.accepts("html")) return controller.findAll(req, res);
  try {
    const users = await db.User.findAll();
    res.render("users/views/list", { users });
  } catch {
    res.sendStatus(503);
  }
});

router.get("/:id", async (req, res) => {
  if (!req.accepts("html")) return controller.findById(req, res);
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.sendStatus(404);
    res.render("users/views/show", { user });
  } catch {
    res.sendStatus(404);
  }
});

module.exports = router;
*/
