/*
 * EXAMPLE MODEL — User
 *
 * Place model files in src/db/models/ — they are loaded automatically.
 * Access anywhere with: const { db } = require("#core/models");
 *
"use strict";
const crypto = require("crypto");

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
        isEmail: true
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
  }, {
    tableName: "users",
    paranoid: true,
  });

  // User.associate = function(models) {
  //   User.belongsTo(models.OtherModel, { foreignKey: "otherModelId" });
  // };

  // User.beforeSave((user, options) => {
  //   const salt = crypto.randomBytes(8).toString("base64");
  //   const derivedKey = crypto.scryptSync(user.password, salt, 128);
  //   user.password = `${salt}:${derivedKey.toString("base64")}`;
  // });

  return User;
};
*/
