const http = require("http");
const url = require("url");
const fs = require("fs");

const PORT = process.env.PORT || 3000;

const server = http.createServer((request, response) => {
    const myURL = url.parse(request.url, true); // new URL(request.url, host?);
    console.log(`request.method: ${request.method}`);
    console.log(`request.headers.content-type: ${request.headers["content-type"]}`);
    console.log(`request.headers.origin: ${request.headers["origin"]}`);
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
    } else if (request.method === "GET" && request.url.startsWith("/db/themes")) {
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json");
        const str = fs.readFileSync("texts.json", "utf8");
        const texts = JSON.parse(str);
        const themes = {};
        Object.keys(texts).forEach(key => {
            themes[key] = Object.keys(texts[key]);
        });
        const result = JSON.stringify(themes);
        response.setHeader("Content-Length", Buffer.byteLength(result));
        response.end(result);
    } else if (request.method === "GET" && request.url.startsWith("/db/text")) {
        if (!myURL.query.category || !myURL.query.theme) {
            response.statusCode = 406;
            response.end(`406 Incorrect parameters`);
            return;
        }
        const category = myURL.query.category;
        const theme = myURL.query.theme;
        const str = fs.readFileSync("texts.json", "utf8");
        const texts = JSON.parse(str);
        if (Object.keys(texts).every(key => key !== category)) {
            response.statusCode = 404;
            response.end(`404 Text with category: ${category} not found!`);
            return;
        }
        if (Object.keys(texts[category]).every(key => key !== theme)) {
            response.statusCode = 404;
            response.end(`404 Text with theme: ${theme} not found!`);
            return;
        }
        const index = Math.trunc(texts[category][theme].length * Math.random());
        // = index;
        const text = JSON.stringify(texts[category][theme][index]);
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json");
        response.setHeader("Content-Length", Buffer.byteLength(text));
        response.end(text);
    } else if (request.method === "POST" && request.url.startsWith("/db/text")) {
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
            const str = fs.readFileSync("texts.json", "utf8");
            const texts = JSON.parse(str);
            if (typeof texts[text.category] !== "object") 
                texts[text.category] = {};

            if (typeof texts[text.category][text.theme] !== "object") 
                texts[text.category][text.theme] = [];

            if (texts[text.category][text.theme].some(str => str === text.body)) {
                response.statusCode = 409;
                response.end(`409 This text alredy exist in: ${text.category}: ${text.theme}!`);
                return;
            }
            texts[text.category][text.theme].push(text.body);
            fs.writeFileSync("texts.json", JSON.stringify(texts, null, 1));
            response.statusCode = 204;
            response.end();
        });
    } else if (request.method === "GET" && request.url.startsWith("/db/user")) {
        if (!myURL.query.login) {
            response.statusCode = 406;
            response.end(`406 Incorrect parameters`);
            return;
        }
        const login = myURL.query.login;
        const str = fs.readFileSync("users.json", "utf8");
        const users = JSON.parse(str);
        if (Object.keys(users).every(key => key !== login)) {
            response.statusCode = 404;
            response.end(`404 User with login: ${myURL.query.login} not found!`);
            return;
        }
        const user = JSON.stringify(users.login);
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json");
        response.setHeader("Content-Length", Buffer.byteLength(user));
        response.end(user);
    } else if (request.method === "POST" && request.url.startsWith("/db/user")) {
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
            if (!user || !user.login) {
                response.statusCode = 406;
                response.end(`406 Incorrect data recived`);
                return;
            }
            const str = fs.readFileSync("users.json", "utf8");
            const users = JSON.parse(str);
            if (Object.keys(users).some(key => key === user.login)) {
                response.statusCode = 409;
                response.end(`409 User with login: ${user.login} alredy exist!`);
                return;
            }
            users[user.login] = user;
            fs.writeFileSync("users.json", JSON.stringify(users, null, 1));
            response.statusCode = 204;
            response.end();
        });
    } else {
        response.statusCode = 404;
        response.end("404 Resourse not found!");
    }
});

server.listen(PORT, "localhost", console.log(`Server starts at port: ${PORT}`));

process.on("uncaughtException", err => { console.error(err); });
