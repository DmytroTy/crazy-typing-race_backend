const db = require("../db");

exports.read = (response, login) => {
    db.query("SELECT * FROM Users WHERE login = $1;", [login])
        .then((result) => {
            if (!result.rows[0]) {
                response.statusCode = 404;
                response.end(`404 User with login: ${login} not found!`);
                return;
            }
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            const user = JSON.stringify(result.rows[0]);
            response.setHeader("Content-Length", Buffer.byteLength(user));
            response.end(user);
        }).catch((err) => {
            console.error('Error executing query', err);
            response.statusCode = 500;
            response.end();
        });
}

exports.create = (response, user) => {
    db.query("INSERT INTO Users(login, passwordHash, email) VALUES ($1, $2,  $3);",
        [user.login, user.password, user.email])
        .then((result) => {
            response.statusCode = 204;
            response.end();
        }).catch((err) => {
            console.error('Error executing query', err);
            if (err.code === "23505") {
                response.statusCode = 409;
                response.end(`409 User with login: ${user.login}, or e-mail: ${user.email} already exist!`);
                return;
            }
            response.statusCode = 500;
            response.end();
        });
}
