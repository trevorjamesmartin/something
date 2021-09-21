exports.up = function (knex) {
  return knex.schema.table("product", (table) => {
    table.string("type", 255);
    table.string("tags"); // CSL of,tags,relating,to,product
  });
};

exports.down = function (knex) {
  return knex.schema.table("product", (table) => {
    table.dropColumn("type");
    table.dropColumn("tags");
  });
};
