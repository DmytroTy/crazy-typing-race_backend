const http = require("http");
const url = require("url");
// const fs = require("fs");
require('dotenv').config();

const route = require("./route");

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
        route.category.read(response);
    }
    else if (request.method === "GET" && request.url.startsWith("/api/v1/themes")) {
        if (!myURL.query.category) {
            response.statusCode = 406;
            response.end("406 Incorrect parameters");
            return;
        };
        const category = myURL.query.category;
        route.theme.read(response, category);
    }
    else if (request.method === "GET" && request.url.startsWith("/api/v1/text")) {
        if (!myURL.query.category || !myURL.query.theme) {
            response.statusCode = 406;
            response.end("406 Incorrect parameters");
            return;
        }
        const { category, theme } = myURL.query;
        route.text.read(response, category, theme);
    }
    else if (request.method === "POST" && request.url.startsWith("/api/v1/category")) {
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
            let obj;
            try {
                obj = JSON.parse(data);
            } catch (err) {
                console.error(err.message);
            }
            if (!obj || !obj.category) {
                response.statusCode = 406;
                response.end("406 Incorrect data recived");
                return;
            }
            route.category.create(response, obj);
        });
    }
    else if (request.method === "POST" && request.url.startsWith("/api/v1/theme")) {
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
            let obj;
            try {
                obj = JSON.parse(data);
            } catch (err) {
                console.error(err.message);
            }
            if (!obj || !obj.category || !obj.theme) {
                response.statusCode = 406;
                response.end("406 Incorrect data recived");
                return;
            }
            route.theme.create(response, obj);
        });
    }
    else if (request.method === "POST" && request.url.startsWith("/api/v1/text")) {
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
            let obj;
            try {
                obj = JSON.parse(data);
            } catch (err) {
                console.error(err.message);
            }
            if (!obj || !obj.category || !obj.theme || !obj.body) {
                response.statusCode = 406;
                response.end("406 Incorrect data recived");
                return;
            }
            route.text.create(response, obj);
        });
    }
    else if (request.method === "GET" && request.url.startsWith("/api/v1/user")) {
        if (!myURL.query.login) {
            response.statusCode = 406;
            response.end("406 Incorrect parameters");
            return;
        }
        const login = myURL.query.login;
        route.user.read(response, login);
    }
    else if (request.method === "POST" && request.url.startsWith("/api/v1/user")) {
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
                response.end("406 Incorrect data recived");
                return;
            }
            route.user.create(response, user);
        });
    }
    else {
        response.statusCode = 404;
        response.end("404 Resourse not found!");
    }
});

server.listen(PORT, console.log(`Server starts at port: ${PORT}`));

process.on("uncaughtException", err => { console.error(err); });

module.exports = server;
