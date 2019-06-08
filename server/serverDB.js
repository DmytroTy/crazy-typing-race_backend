// const fs = require("fs");
const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
require('dotenv').config();

const route = require("./route");

const PORT = process.env.PORT || 3000;

const app = new Koa();
app.use(bodyParser());

app.use(async (ctx, next) => {
    ctx.set("Access-Control-Allow-Origin", ctx.header["origin"] || "*");
    // ctx.set("Vary", "*");
    // ctx.set("Cache-Control", "no-store");
    if (ctx.method === "POST" && ctx.header["content-type"] !== "application/json") {
        // request.resume();
        ctx.status = 415;
        ctx.body = `Expected application/json but received ${ctx.header["content-type"]}`;
        return;
    }
    await next();
});

const router = new Router();

router.get("/api/v1/categories", route.category.read);
router.get("/api/v1/themes", route.theme.read);
router.get("/api/v1/text", route.text.read);
router.get("/api/v1/user", route.user.read);
router.post("/api/v1/category", route.category.create);
router.post("/api/v1/theme", route.theme.create);
router.post("/api/v1/text", route.text.create);
router.post("/api/v1/user", route.user.create);

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT, "localhost", console.log(`Server starts at port: ${PORT}`));

process.on("uncaughtException", err => { console.error(err); });

module.exports = app;
