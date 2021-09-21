exports.up = function (knex) {
  return knex.schema.createTable("product", function (table) {
    table.increments("id");
    table.string("name", 255).notNullable();
    table.string("description", 255);
  });
};

exports.down = function (knex) {
  return knex.dropTable("product");
};
