const pkg = require("pg")
// import pkg from "pg"
const dotenv = require('dotenv')
const fs = require('fs')
const DB_URI = process.env.DB_PG_URI
const connectionString = DB_URI

const { Pool } = pkg
dotenv.config()

const pool = new Pool({
  connectionString
})

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('../ca-cert-postgres-database/ca.pem').toString()
  }
})

module.exports = {pool}

// pool.on('connect', () => {
//   console.log('Connection pool established with Database')
// })