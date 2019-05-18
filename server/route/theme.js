const db = require("../db");

exports.read = (response, category) => {
    db.query("SELECT ID AS IDtheme, theme FROM Themes \
        WHERE IDcategory = (SELECT ID FROM Categories WHERE category = $1) \
        ORDER BY theme;", [category])
        .then((result) => {
            if (!result.rows[0]) {
                response.statusCode = 404;
                response.end(`404 Themes with category: ${category} not found!`);
                return;
            }
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            const themes = JSON.stringify(result.rows);
            response.setHeader("Content-Length", Buffer.byteLength(themes));
            response.end(themes);
        }).catch((err) => {
            console.error('Error executing query', err);
            response.statusCode = 500;
            response.end();
        });
}

exports.create = (response, obj) => {
    db.query("INSERT INTO Themes(IDcategory, theme) \
        VALUES (\
            (SELECT ID FROM Categories WHERE category = $1),\
            $2\
        );", [obj.category, obj.theme])
        .then((result) => {
            response.statusCode = 204;
            response.end();
        }).catch((err) => {
            console.error('Error executing query', err);
            if (err.code === "23505") {
                response.statusCode = 409;
                response.end(`409 This theme: ${obj.theme} already exist in category: ${obj.category}!`);
                return;
            }
            if (err.code === "23502") {
                response.statusCode = 409;
                response.end(`409 Category: ${obj.category} not exist`);
                return;
            }
            response.statusCode = 500;
            response.end();
        });
}
