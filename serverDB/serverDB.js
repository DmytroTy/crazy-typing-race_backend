const http = require("http");
const url = require("url");
const fs = require("fs");
const db = require("./db");

const PORT = process.env.PORT || 3000;

const server = http.createServer((request, response) => {
    const myURL = url.parse(request.url, true); // new URL(request.url, host?);
    /* console.log(`request.method: ${request.method}`);
    console.log(`request.headers.content-type: ${request.headers["content-type"]}`);
    console.log(`request.headers.origin: ${request.headers["origin"]}`); */
    response.setHeader("Content-Type", "text/plain");
    response.setHeader("Access-Control-Allow-Origin", request.headers["origin"] || "*");
    response.setHeader("Vary", "*");
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Keep-Alive", "timeout=2, max=99");
    response.setHeader("Connection", "Keep-Alive");
    if (request.method === "OPTIONS") {
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setHeader("Access-Control-Max-Age", 86400);
        response.statusCode = 200;
        response.setHeader("Content-Length", 0);
        response.end();
        return;
    };
    if (request.method === "GET" && request.url.startsWith("/api/v1/categories")) {
        db.query("SELECT category FROM Categories;")
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
        return;
    };
    if (request.method === "GET" && request.url.startsWith("/api/v1/themes")) {
        if (!myURL.query.category) {
            response.statusCode = 406;
            response.end(`406 Incorrect parameters`);
            return;
        };
        const category = myURL.query.category;
        db.query("SELECT theme FROM Themes \
            WHERE IDcategory = (SELECT ID FROM Categories WHERE category = $1);", [category])
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
        return;
    };
    if (request.method === "GET" && request.url.startsWith("/api/v1/text")) {
        if (!myURL.query.category || !myURL.query.theme) {
            response.statusCode = 406;
            response.end(`406 Incorrect parameters`);
            return;
        }
        const category = myURL.query.category;
        const theme = myURL.query.theme;
        db.query("SELECT ID, body FROM Texts \
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
                // ToDo = result.rows[index].ID;
                const text = JSON.stringify(result.rows[index]);
                response.setHeader("Content-Length", Buffer.byteLength(text));
                response.end(text);
            }).catch((err) => {
                console.error('Error executing query', err);
                response.statusCode = 500;
                response.end();
            });
        return;
    };
    if (request.method === "POST" && request.url.startsWith("/api/v1/category")) {
        if (request.headers["content-type"] !== "application/json") {
            request.resume();
            response.statusCode = 415;
            response.end(`Expected application/json but received ${request.headers["content-type"]}`);
            return;
        }
        request.setEncoding("utf8");
        let data = "";
        request.on("data", chunk => { data += chunk; });
        request.on("end", () => {
            let text;
            try {
                text = JSON.parse(data);
            } catch (err) {
                console.error(err.message);
            }
            if (!text || !text.category) {
                response.statusCode = 406;
                response.end(`406 Incorrect data recived`);
                return;
            }
            db.query("INSERT INTO Categories(category) VALUES ($1);", [text.category])
                .then((result) => {
                    response.statusCode = 204;
                    response.end();
                }).catch((err) => {
                    console.error('Error executing query', err);
                    response.statusCode = 500;
                    response.end();
                });
            return;
        });
    };
    if (request.method === "POST" && request.url.startsWith("/api/v1/theme")) {
        if (request.headers["content-type"] !== "application/json") {
            request.resume();
            response.statusCode = 415;
            response.end(`Expected application/json but received ${request.headers["content-type"]}`);
            return;
        }
        request.setEncoding("utf8");
        let data = "";
        request.on("data", chunk => { data += chunk; });
        request.on("end", () => {
            let text;
            try {
                text = JSON.parse(data);
            } catch (err) {
                console.error(err.message);
            }
            if (!text || !text.category || !text.theme) {
                response.statusCode = 406;
                response.end(`406 Incorrect data recived`);
                return;
            }
            db.query("INSERT INTO Themes(IDcategory, theme) \
                VALUES (\
                    (SELECT ID FROM Categories WHERE category = $1),\
                    $2\
                );", [text.category, text.theme])
                .then((result) => {
                    response.statusCode = 204;
                    response.end();
                }).catch((err) => {
                    console.error('Error executing query', err);
                    response.statusCode = 500;
                    response.end();
                });
            return;
        });
    };
    if (request.method === "POST" && request.url.startsWith("/api/v1/text")) {
        if (request.headers["content-type"] !== "application/json") {
            request.resume();
            response.statusCode = 415;
            response.end(`Expected application/json but received ${request.headers["content-type"]}`);
            return;
        }
        request.setEncoding("utf8");
        let data = "";
        request.on("data", chunk => { data += chunk; });
        request.on("end", () => {
            let text;
            try {
                text = JSON.parse(data);
            } catch (err) {
                console.error(err.message);
            }
            if (!text || !text.category || !text.theme || !text.body) {
                response.statusCode = 406;
                response.end(`406 Incorrect data recived`);
                return;
            }
            db.query("INSERT INTO Texts(IDtheme, body) \
                VALUES (\
                    (SELECT ID FROM Themes \
                        WHERE IDcategory = (SELECT ID FROM Categories WHERE category = $1)\
                        AND theme = $2),\
                    $3\
                ) RETURNING *;", [text.category, text.theme, text.body])
                .then((result) => {
                    /* response.statusCode = 200;
                    response.setHeader("Content-Type", "application/json");
                    const text = JSON.stringify(result.rows[0]);
                    response.setHeader("Content-Length", Buffer.byteLength(text));
                    response.end(text); */
                    response.statusCode = 204;
                    response.end();
                }).catch((err) => {
                    console.error('Error executing query', err);
                    response.statusCode = 500;
                    response.end();
                    /* if ()) {
                        response.statusCode = 409;
                        response.end(`409 This text alredy exist in: ${text.category}: ${text.theme}!`);
                        return;
                    } */
                });
            return;
        });
    };
    if (request.method === "GET" && request.url.startsWith("/api/v1/user")) {
        if (!myURL.query.login) {
            response.statusCode = 406;
            response.end(`406 Incorrect parameters`);
            return;
        }
        const login = myURL.query.login;
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
        return;
    };
    if (request.method === "POST" && request.url.startsWith("/api/v1/user")) {
        if (request.headers["content-type"] !== "application/json") {
            request.resume();
            response.statusCode = 415;
            response.end(`Expected application/json but received ${request.headers["content-type"]}`);
            return;
        }
        request.setEncoding("utf8");
        let data = "";
        request.on("data", chunk => { data += chunk; });
        request.on("end", () => {
            let user;
            try {
                user = JSON.parse(data);
            } catch (err) {
                console.error(err.message);
            }
            if (!user || !user.login || !user.password || !user.email) {
                response.statusCode = 406;
                response.end(`406 Incorrect data recived`);
                return;
            }
            db.query("INSERT INTO Users(login, passwordHash, email) VALUES ($1, $2,  $3);",
                [user.login, user.password, user.email])
                .then((result) => {
                    response.statusCode = 204;
                    response.end();
                }).catch((err) => {
                    console.error('Error executing query', err);
                    response.statusCode = 500;
                    response.end();
                    /* if (Object.keys(users).some(key => key === user.login)) {
                        response.statusCode = 409;
                        response.end(`409 User with login: ${user.login} alredy exist!`);
                        return;
                    } */
                });
            return;
        });
    }
    response.statusCode = 404;
    response.end("404 Resourse not found!");
});

server.listen(PORT, "localhost", console.log(`Server starts at port: ${PORT}`));

process.on("uncaughtException", err => { console.error(err); });
