const db = require("../db");

exports.read = async (ctx, next) => {
    const category = ctx.query.category;
    if (!category) {
        ctx.status = 406;
        ctx.body = "406 Incorrect parameters";
        return;
    };
    let result;
    try {
        result = await db.query("SELECT ID AS IDtheme, theme FROM Themes \
            WHERE IDcategory = (SELECT ID FROM Categories WHERE category = $1) \
            ORDER BY theme;", [category]);
    } catch (err) {
        console.error('Error executing query', err);
        ctx.body = null;
        ctx.status = 500;
        return;
    }
    if (!result.rows[0]) {
        ctx.status = 404;
        ctx.body = `404 Themes with category: ${category} not found!`;
        return;
    }
    ctx.status = 200;
    ctx.body = result.rows;
}

exports.create = async (ctx, next) => {
    obj = ctx.request.body;
    if (!obj || !obj.category || !obj.theme) {
        ctx.status = 406;
        ctx.body = "406 Incorrect data recived";
        return;
    }
    try {
        await db.query("INSERT INTO Themes(IDcategory, theme) \
            VALUES (\
                (SELECT ID FROM Categories WHERE category = $1),\
                $2\
            );", [obj.category, obj.theme]);
    } catch (err) {
        console.error('Error executing query', err);
        if (err.code === "23505") {
            ctx.status = 409;
            ctx.body = `409 This theme: ${obj.theme} already exist in category: ${obj.category}!`;
            return;
        }
        if (err.code === "23502") {
            ctx.status = 409;
            ctx.body = `409 Category: ${obj.category} not exist`;
            return;
        }
        ctx.body = null;
        ctx.status = 500;
        return;
    }
    ctx.body = null;
    ctx.status = 201;
}
