const db = require("../db");

exports.read = (ctx, next) => {
    const login = ctx.query.login;
    if (!login) {
        ctx.status = 406;
        ctx.body = "406 Incorrect parameters";
        return;
    }
    db.query("SELECT * FROM Users WHERE login = $1;", [login])
        .then((result) => {
            if (!result.rows[0]) {
                ctx.status = 404;
                ctx.body = `404 User with login: ${login} not found!`;
                return;
            }
            ctx.status = 200;
            // ctx.set("Content-Type", "application/json");
            const user = JSON.stringify(result.rows[0]);
            ctx.body = user;
        }).catch((err) => {
            console.error('Error executing query', err);
            ctx.status = 500;
            ctx.body = null;
        });
}

exports.create = (ctx, next) => {
    user = ctx.request.body;
    if (!user || !user.login || !user.password || !user.email) {
        ctx.status = 406;
        ctx.body = "406 Incorrect data recived";
        return;
    }
    db.query("INSERT INTO Users(login, passwordHash, email) VALUES ($1, $2,  $3);",
        [user.login, user.password, user.email])
        .then(() => {
            ctx.status = 201;
            ctx.body = null;
        }).catch((err) => {
            console.error('Error executing query', err);
            if (err.code === "23505") {
                ctx.status = 409;
                ctx.body = `409 User with login: ${user.login}, or e-mail: ${user.email} already exist!`;
                return;
            }
            ctx.status = 500;
            ctx.body = null;
        });
}
