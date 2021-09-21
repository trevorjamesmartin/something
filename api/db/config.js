const knex = require('knex');

const config = require('../knexfile');

const environment = process.env.DB_ENVIRONMENT || "development";

module.exports = knex(config[environment]);
