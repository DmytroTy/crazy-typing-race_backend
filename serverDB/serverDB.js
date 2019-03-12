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
    } else if (request.method === "GET" && request.url.startsWith("/db/text")) {
        if (myURL.query.category !== undefined && myURL.query.theme !== undefined) {
            const category = myURL.query.category;
            const theme = myURL.query.theme;
            const str = fs.readFileSync("texts.json", "utf8");
            const texts = JSON.parse(str);
            if (Object.keys(texts).some(key => key === category)) {
                if (Object.keys(texts[category]).some(key => key === theme)) {
                    const index = Math.trunc(texts[category][theme].length * Math.random());
                    // = index;
                    const text = JSON.stringify(texts[category][theme][index]);
                    response.statusCode = 200;
                    response.setHeader("Content-Type", "application/json");
                    response.end(text);
                } else {
                    response.statusCode = 404;
                    response.setHeader("Content-Type", "text/plain");
                    response.end(`404 Text with theme: ${theme} not found!`);
                }
            } else {
                response.statusCode = 404;
                response.setHeader("Content-Type", "text/plain");
                response.end(`404 Text with category: ${category} not found!`);
            }
        } else {
            response.statusCode = 404;
            response.setHeader("Content-Type", "text/plain");
            response.end(`404 Incorrect parameters`);
        }
    } else if (request.method === "POST" && request.url.startsWith("/db/add/text")) {
        if (request.headers["Content-Type"] !== "application/json") {
            request.resume();
            response.statusCode = 404;
            response.setHeader("Content-Type", "text/plain");
            response.end(`404 Incorrect data recived`);
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
            if (text !== undefined && text.category !== undefined && text.theme !== undefined && text.body !== undefined) {
                const str = fs.readFileSync("texts.json", "utf8");
                const texts = JSON.parse(str);
                texts[text.category][text.theme].push(text.body);
                fs.writeFileSync("texts.json", JSON.stringify(texts));
                response.statusCode = 200;
                response.setHeader("Content-Type", "text/plain");
                response.end("OK");
            } else {
                response.statusCode = 404;
                response.setHeader("Content-Type", "text/plain");
                response.end(`404 Incorrect data recived`);
            }
        });
    } else if (request.method === "GET" && request.url.startsWith("/db/user")) {
        if (myURL.query.login !== undefined) {
            const login = myURL.query.login;
            const str = fs.readFileSync("users.json", "utf8");
            const users = JSON.parse(str);
            if (Object.keys(users).some(key => key === login)) {
                const user = JSON.stringify(users.login);
                response.statusCode = 200;
                response.setHeader("Content-Type", "application/json");
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
    } else if (request.method === "POST" && request.url.startsWith("/db/add/user")) {
        if (request.headers["Content-Type"] !== "application/json") {
            request.resume();
            response.statusCode = 404;
            response.setHeader("Content-Type", "text/plain");
            response.end(`404 Incorrect data recived`);
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
            if (user !== undefined && user.login !== undefined) {
                const str = fs.readFileSync("users.json", "utf8");
                const users = JSON.parse(str);
                if (Object.keys(users).every(key => key !== user.login)) {
                    users[user.login] = user;
                    fs.writeFileSync("users.json", JSON.stringify(users));
                    response.statusCode = 200;
                    response.setHeader("Content-Type", "text/plain");
                    response.end("OK");
                } else {
                    response.statusCode = 404;
                    response.setHeader("Content-Type", "text/plain");
                    response.end(`404 User with login: ${user.login} alredy exist!`);
                }
            } else {
                response.statusCode = 404;
                response.setHeader("Content-Type", "text/plain");
                response.end(`404 Incorrect data recived`);
            }
        });
    } else {
        response.statusCode = 404;
        response.setHeader("Content-Type", "text/plain");
        response.end("404 Resourse not found!");
    }
});

server.listen(PORT, "localhost", console.log(`Server starts at port: ${PORT}`));

process.on("uncaughtException", err => { console.error(err.message); });
