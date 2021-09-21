exports.up = function (knex) {
  return knex.schema.table("product", (table) => {
    table.string("image_url", 255);
  });
};

exports.down = function (knex) {
  return knex.schema.table("product", (table) => {
    table.dropColumn("image_url");
  });
};
