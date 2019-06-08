const db = require("../db");

exports.read = async (ctx, next) => {
    const { category, theme } = ctx.query;
    if (!category || !theme) {
        ctx.status = 406;
        ctx.body = "406 Incorrect parameters";
        return;
    }
    let result;
    try {
        result = await db.query("SELECT * FROM Texts \
            WHERE IDtheme = (SELECT ID FROM Themes \
            WHERE IDcategory = (SELECT ID FROM Categories WHERE category = $1)\
                AND theme = $2);", [category, theme]);
    } catch (err) {
        console.error('Error executing query', err);
        ctx.status = 500;
        ctx.body = null;
        return;
    }
    if (!result.rows[0]) {
        ctx.status = 404;
        ctx.body = `404 Text with category: ${category}, theme: ${theme} not found!`;
        return;
    }
    ctx.status = 200;
    const index = Math.trunc(result.rows.length * Math.random());
    ctx.body = result.rows[index];
}

exports.create = async (ctx, next) => {
    obj = ctx.request.body;
    if (!obj || !obj.category || !obj.theme || !obj.body) {
        ctx.status = 406;
        ctx.body = "406 Incorrect data recived";
        return;
    }
    try {
        await db.query("INSERT INTO Texts(IDtheme, body) \
            VALUES (\
                (SELECT ID FROM Themes \
                    WHERE IDcategory = (SELECT ID FROM Categories WHERE category = $1)\
                    AND theme = $2),\
                $3\
            );", [obj.category, obj.theme, obj.body]);
    } catch (err) {
        console.error('Error executing query', err);
        if (err.code === "23505") {
            ctx.status = 409;
            ctx.body = `409 This text already exist in: ${obj.category}: ${obj.theme}!`;
            return;
        }
        if (err.code === "23502") {
            ctx.status = 409;
            ctx.body = `409 Category: ${obj.category} or theme: ${obj.theme} not exist!`;
            return;
        }
        ctx.status = 500;
        ctx.body = null;
        return;
    }
    ctx.status = 201;
    ctx.body = null;
}
