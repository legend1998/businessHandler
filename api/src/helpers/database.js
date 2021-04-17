const knex = require("knex");

const env = require("../../config/environment");

const database = knex({
  client: env.config.database.type,
  version: env.config.database.version,
  connection: {
    host: env.config.database.host,
    user: env.config.database.user,
    password: env.config.database.pass,
    port: parseInt(env.config.database.port),
    database: env.config.database.name,
    connectionTimeout: 15000,
    requestTimeout: 60000,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

module.exports = database;
