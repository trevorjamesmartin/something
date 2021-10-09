const db = require("../../db/config");

module.exports = {
  get: {
    All: getAll,
    Where: getWhere,
    ByName: getByName,
  },
  put: {
    Update: updateMedia,
  },
  post: {
    Create: newMedia,
  },
};

function getAll() {
  return db("media");
}

function getWhere(options) {
  return db("media").where(options);
}

function getByName(name) {
  return db("media").where({ name }).first();
}

function updateMedia(name, changes) {
  return db("media").where({ name }).update(changes);
}

function newMedia(record) {
  // (perform an UPSERT) https://knexjs.org/#Builder-onConflict
  return db("media").insert(record).onConflict("name").merge();
}
