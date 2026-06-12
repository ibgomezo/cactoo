"use strict";
const crypto = require("crypto");
const Node = require("./node");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    }, 
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail:true
      },
      unique: {
        args: true,
        msg: "Email address already in use!"
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("administrator", "viewer", "manager", "external"),
      allowNull: false,
    },
    nodeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    tableName: "users",
    paranoid: true //Agrega el atributo deletedAt y usa borrado lógico
  });

  // User.associate = function(models) {
  //   // associations can be defined here
  // };

  // User.belongsTo(Node, {
  //   foreignKey: {
  //     name: "nodeId",
  //     allowNull: true
  //   },
  // });

  // User.beforeSave((user, options) => {
  //   user.password = crypto.createHash("sha256").update(user.password).digest("hex");
  //   return
  // });

  return User;
};