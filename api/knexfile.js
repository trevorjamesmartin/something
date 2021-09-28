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
    client: "sqlite3",
    connection: {
      // sqlite3 production container
      filename: "../mnt/something.db",
    },
    migrations: { directory: "./db/migrations" },
    seeds: { directory: "./db/seeds" },
    useNullAsDefault: true,
  },

  production2: {
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
  release: {
    client: "sqlite3",
    connection: {
      // intended to run outside of a container
      filename: "./db/something.db",
    },
    migrations: { directory: "./db/migrations" },
    seeds: { directory: "./db/seeds" },
    useNullAsDefault: true,
  },
};
