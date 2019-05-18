const db = require("../db");

exports.read = response => {
    db.query("SELECT category FROM Categories ORDER BY category;")
        .then((result) => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            const categories = JSON.stringify(result.rows);
            response.setHeader("Content-Length", Buffer.byteLength(categories));
            response.end(categories);
        }).catch((err) => {
            console.error('Error executing query', err);
            response.statusCode = 500;
            response.end();
        });
}

exports.create = (response, obj) => {
    db.query("INSERT INTO Categories(category) VALUES ($1);", [obj.category])
        .then((result) => {
            response.statusCode = 204;
            response.end();
        }).catch((err) => {
            console.error('Error executing query', err);
            if (err.code === "23505") {
                response.statusCode = 409;
                response.end(`409 This category: ${obj.category} already exist!`);
                return;
            }
            response.statusCode = 500;
            response.end();
        });
}
