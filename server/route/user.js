const db = require("../db");

exports.read = async (ctx, next) => {
    const login = ctx.query.login;
    if (!login) {
        ctx.status = 406;
        ctx.body = "406 Incorrect parameters";
        return;
    }
    let result;
    try {
        result = await db.query("SELECT * FROM Users WHERE login = $1;", [login]);
    } catch (err) {
        console.error('Error executing query', err);
        ctx.body = null;
        ctx.status = 500;
        return;
    }
    if (!result.rows[0]) {
        ctx.status = 404;
        ctx.body = `404 User with login: ${login} not found!`;
        return;
    }
    ctx.status = 200;
    ctx.body = result.rows[0];
}

exports.create = async (ctx, next) => {
    user = ctx.request.body;
    if (!user || !user.login || !user.password || !user.email) {
        ctx.status = 406;
        ctx.body = "406 Incorrect data recived";
        return;
    }
    try {
        await db.query("INSERT INTO Users(login, passwordHash, email) VALUES ($1, $2,  $3);",
            [user.login, user.password, user.email]);
    } catch (err) {
        console.error('Error executing query', err);
        if (err.code === "23505") {
            ctx.status = 409;
            ctx.body = `409 User with login: ${user.login}, or e-mail: ${user.email} already exist!`;
            return;
        }
        ctx.body = null;
        ctx.status = 500;
        return;
    }
    ctx.body = null;
    ctx.status = 201;
}
