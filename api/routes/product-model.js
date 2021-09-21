const db = require("../db/config");

module.exports = { getAll, getWhere, getById };

function getAll() {
  return db("product");
}

function getWhere(options) {
  return db("product").where(options);
}

function getById(id) {
  return db("product").where({ id }).first();
}
