const db = require("../db");

exports.read = (ctx, next) => {
    db.query("SELECT category FROM Categories ORDER BY category;")
        .then((result) => {
            ctx.status = 200;
            // ctx.set("Content-Type", "application/json");
            const categories = JSON.stringify(result.rows);
            ctx.body = categories;
        }).catch((err) => {
            console.error('Error executing query', err);
            ctx.status = 500;
            ctx.body = null;
        });
}

exports.create = (ctx, next) => {
    obj = ctx.request.body;
    if (!obj || !obj.category) {
        ctx.status = 406;
        ctx.body = "406 Incorrect data recived";
        return;
    }
    db.query("INSERT INTO Categories(category) VALUES ($1);", [obj.category])
        .then(() => {
            ctx.status = 201;
            ctx.body = null;
        }).catch((err) => {
            console.error('Error executing query', err);
            if (err.code === "23505") {
                ctx.status = 409;
                ctx.body = `409 This category: ${obj.category} already exist!`;
                return;
            }
            ctx.status = 500;
            ctx.body = null;
        });
}
