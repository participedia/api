const log = require("winston");
require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const http = require("http");
const app = require("./app");

http.createServer(app).listen(app.get("port"), () => {
  log.info(`Express server listening on port ${app.get("port")}`);
});
