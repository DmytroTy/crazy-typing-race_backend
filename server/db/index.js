const { Pool } = require("pg");

const pool = new Pool();

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: (callback) => 
        pool.connect((err, client, release) => callback(err, client, release))
}
