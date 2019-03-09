const http = require("http");
const url = require("url");
const fs = require("fs");

const PORT = process.env.PORT || 3000;

const server = http.createServer((request, response) => {
    const myURL = url.parse(request.url, true);
    if (request.method === "GET" && request.url.startsWith("/db/themes")) {
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json");
        const str = fs.readFileSync("texts.json", "utf8");
        const texts = JSON.parse(str);
        const themes = {};
        Object.keys(texts).forEach(key => {
            themes[key] = Object.keys(texts[key]);
        });
        const result = JSON.stringify(themes);
        response.end(result);
    } else if (request.method === "GET" && request.url.startsWith("/db/user")) {
        response.statusCode = 200;
        if (myURL.query.login !== undefined) {
            const login = myURL.query.login;
            response.setHeader("Content-Type", "application/json");
            const str = fs.readFileSync("users.json", "utf8");
            const users = JSON.parse(str);
            if (Object.keys(users).some(key => key === login)) {
                const user = JSON.stringify(users.login);
                response.end(user);
            } else {
                response.statusCode = 404;
                response.setHeader("Content-Type", "text/plain");
                response.end(`404 User with login: ${myURL.query.login} not found!`);
            }
        } else {
            response.statusCode = 404;
            response.setHeader("Content-Type", "text/plain");
            response.end(`404 Incorrect parameters`);
        }
    } /* else if (request.method === "POST") {
        if (myURL.query.login !== undefined)
    } */ else {
        response.statusCode = 404;
        response.setHeader("Content-Type", "text/plain");
        response.end("404 Resourse not found!");
    }
});

server.listen(PORT, "localhost", console.log(`Server starts at port: ${PORT}`));
