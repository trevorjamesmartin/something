exports.up = function (knex) {
  return knex.schema.table("product", (table) => {
    table.boolean("deleted").default(false);
  });
};

exports.down = function (knex) {
  return knex.schema.table("product", (table) => {
    table.dropColumn("deleted");
  });
};
