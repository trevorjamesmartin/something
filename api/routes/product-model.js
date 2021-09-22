const db = require("../db/config");

module.exports = { getAll, getWhere, getById, newProduct, emptyTrash, trash, getTrash, getTrashById };

function getAll() {
  return db("product").where({ deleted: false });
}

function getWhere(options) {
  return db("product").where({ ...options, deleted: false });
}

function getTrash() {
  return db("product").where({ deleted: true });
}

function getTrashById(id) {
  return db("product").where({ id, deleted: true }).first();
}

function getById(id) {
  return db("product").where({ id, deleted: false }).first();
}

function newProduct({ name, description, image_url, type, tags, format }) {
  // all strings.
  const param_error = [name, description, image_url, type, tags, format]
    .map((s) => typeof s === "string")
    .includes(false);
  if (param_error) {
    return { error: "parameter check failed." };
  }
  return db("product").insert({
    name,
    description,
    image_url,
    type,
    tags,
    format,
  });
}

function trash(id) {
  // mark for deletion
  return db("product").where({ id }).update({ deleted: true });
}

function emptyTrash(id) {
  if (!id || id === "") {
    // permanently remove all products marked for deletion.
    return db("product").where({ deleted: true }).del();
  }
  // permanently remove item with (id) if marked for deletion. 
  return db("product").where({ id, deleted: true }).del();
}
