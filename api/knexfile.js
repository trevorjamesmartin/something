// Update with your config settings.

module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "../mnt/something.db",
    },
    migrations: { directory: "./db/migrations" },
    seeds: { directory: "./db/seeds" },
    useNullAsDefault: true,
  },

  staging: {
    client: "pg",
    connection: process.env.DATABASE,
    pool: {
      min: 2,
      max: 10,
    },
    seeds: { directory: "./db/seeds" },
    migrations: {
      tableName: "knex_migrations",
      directory: "./db/migrations",
    },
  },

  production: {
    client: "pg",
    connection: process.env.DATABASE,
    pool: {
      min: 2,
      max: 10,
    },
    seeds: { directory: "./db/seeds" },
    migrations: {
      tableName: "knex_migrations",
      directory: "./db/migrations",
    },
  },
};
