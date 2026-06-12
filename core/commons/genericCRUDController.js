"use strict"

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const operators = { 
  NE: "!=", 
  OR: "or",
  IN: "in",
  NOTIN: "notin",
  LIKE: "like" 
}

function clean(reg) {
  reg = reg.dataValues;
  delete reg.createdAt;
  delete reg.updatedAt;
  delete reg.deletedAt;
  if (reg.password) delete reg.password;
  return reg;
}

function parseQuery(model, query, result) {
  let isAttr = false;
  for (let param in query) {
    for (let attr in model.rawAttributes) {
      if (param == attr) {
        isAttr = true;
        if (query[param] instanceof Object) {
          result[attr] = parseQuery(model, query[param], {});
        } else {
          result[attr] = query[param];
        }
        break;
      }
    }
    if (!isAttr) {
      switch (param){
      case operators.NE:
        result[Op.ne] = query[param];
        break;
      case operators.OR:
        result[Op.or] = parseQuery(model, query[param], {})
        break;
      case operators.IN:
        result[Op.in] = stringToArray(query[param])
        break;
      case operators.NOTIN:
        result[Op.notin] = stringToArray(query[param])
        break;
      case operators.LIKE:
        result[Op.like] = query[param]
        break;
      }
    }
    isAttr = false;
  }
  return result;
}

function stringToArray(str) {
  str = str.substring(1, str.length -1);
  str = str.split(",");
  return str;
}

module.exports = class GenericCRUDController {

  constructor(model) {
    this.model = model;
  }

  create(req, res) {
    this.model.create(req.body)
      .then(obj => {
        res.send(clean(obj))
      })
      .catch(err => {
        res.sendStatus(400)
      })
  }

  update(req, res) {
    this.model.findByPk(req.params.id)
      .then(obj => {
        return obj.update(req.body)
      })
      .then(obj => {
        res.send(clean(obj))
      })
      .catch(err => {
        res.sendStatus(400)
      })
  }

  destroy(req, res) {
    this.model.findByPk(req.params.id)
      .then(obj => {
        return obj.destroy()
      })
      .then(obj => {
        res.send(clean(obj))
      })
      .catch(err => {
        res.sendStatus(404)
      })
  }

  findAll(req, res) {
    let parsed = req.query.where ? parseQuery(this.model, JSON.parse(req.query.where), {}) : null;
    let where = parsed ? { where: parsed } : {deletedAt: null, order: [["createdAt", "ASC"]]} ;
    this.model.findAll(where)
      .then(list => {
        list = list.map(clean);
        res.send(list)
      })
      .catch(err => {
        res.sendStatus(503)
      });
  }

  findById(req, res) {
    this.model.findByPk(req.params.id)
      .then(reg => {
        res.send(clean(reg))
      })
      .catch(err => {
        res.sendStatus(404)
      });
  }

  find(req, res) {
    this.model.find(parseQuery(this.model, req.query))
      .then(reg => {
        res.send(clean(reg))
      })
      .catch(err => {
        res.sendStatus(404)
      });
  }

}
