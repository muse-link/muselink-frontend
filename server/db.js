const { Pool } = require("pg");

// Si en .env YA pusiste ?sslmode=require, no le sumes nada acá
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // necesario para Render/servicios en la nube
  },
});

module.exports = pool;