const db = require("../db");

exports.read = (response, category, theme) => {
    db.query("SELECT * FROM Texts \
        WHERE IDtheme = (SELECT ID FROM Themes \
        WHERE IDcategory = (SELECT ID FROM Categories WHERE category = $1)\
            AND theme = $2);", [category, theme])
        .then((result) => {
            if (!result.rows[0]) {
                response.statusCode = 404;
                response.end(`404 Text with category: ${category}, theme: ${theme} not found!`);
                return;
            }
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            const index = Math.trunc(result.rows.length * Math.random());
            const text = JSON.stringify(result.rows[index]);
            response.setHeader("Content-Length", Buffer.byteLength(text));
            response.end(text);
        }).catch((err) => {
            console.error('Error executing query', err);
            response.statusCode = 500;
            response.end();
        });
}

exports.create = (response, obj) => {
    db.query("INSERT INTO Texts(IDtheme, body) \
        VALUES (\
            (SELECT ID FROM Themes \
                WHERE IDcategory = (SELECT ID FROM Categories WHERE category = $1)\
                AND theme = $2),\
            $3\
        );", [obj.category, obj.theme, obj.body])
        .then((result) => {
            response.statusCode = 201;
            response.end();
        }).catch((err) => {
            console.error('Error executing query', err);
            if (err.code === "23505") {
                response.statusCode = 409;
                response.end(`409 This text already exist in: ${obj.category}: ${obj.theme}!`);
                return;
            }
            if (err.code === "23502") {
                response.statusCode = 409;
                response.end(`409 Category: ${obj.category} or theme: ${obj.theme} not exist!`);
                return;
            }
            response.statusCode = 500;
            response.end();
        });
}
