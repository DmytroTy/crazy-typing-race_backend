const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString, max: 20 });

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: (callback) => 
        pool.connect((err, client, release) => callback(err, client, release))
}
