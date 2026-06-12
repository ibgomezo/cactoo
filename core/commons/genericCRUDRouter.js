let GenericCRUDController = require("./genericCRUDController");
let policies = require("../policies/");
let middlewares = require("../middlewares");

module.exports = function(router, model) {
  let controller = new GenericCRUDController(model);

  router.route("/")
    .get(
      policies, 
      middlewares,  
      function(req, res) {
        controller.findAll(req, res)
      })
    .post(
      policies,
      middlewares,
      function(req, res) {
        controller.create(req, res)
      })

  router.route("/:id")
    .get(
      policies, 
      middlewares,
      function(req, res,) { 
        controller.findById(req, res) 
      })
    .patch(
      policies,
      middlewares, 
      function(req, res) { 
        controller.update(req, res) 
      })
    .delete(
      policies, 
      middlewares,
      function(req, res) { 
        controller.destroy(req, res) 
      })
}