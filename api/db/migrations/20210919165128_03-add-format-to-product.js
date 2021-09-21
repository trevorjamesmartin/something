exports.up = function (knex) {
  return knex.schema.table("product", (table) => {
    table.string("format", 255).default('flower');
  });
};

exports.down = function (knex) {
  return knex.schema.table("product", (table) => {
    table.dropColumn("format");
  });
};
