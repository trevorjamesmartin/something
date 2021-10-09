exports.up = function (knex) {
  return knex.schema.createTable("media", function (table) {
    table.string("name", 255).defaultTo(`${knex.fn.now()}`).primary();
    table.string("description", 255); // alt="...description"
    // image upload "metadata" 
    table.string("originalname", 255); // file_name
    table.string("encoding", 255);
    table.string("mimetype", 255);
    table.string("destination", 255);
    table.string("filename", 255);
    table.string("path", 255);
    table.integer("size");
    // ** future **
    table.string("owner", 255).defaultTo("public");
    table.string("group", 255).defaultTo("public");
  });
};

exports.down = function (knex) {
  return knex.dropTable("media");
};

