const path = require("path");
require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const app = require("express")();
const log = require("winston");
const jwt = require("express-jwt");

if (
  process.env.NODE_ENV === "test" &&
  process.env.AUTH0_CLIENT_SECRET !== "notasecret"
) {
  log.error(
    "CODING ERROR: Someone imported 'app' before 'setupenv' in the test suite"
  );
  process.exit(1);
}

// Set up the token security handler
// let config = {
//   appRoot: path.join(__dirname, ".."), // required config
//   validateResponse: false
// };
const express = require("express");
const compression = require("compression");
const AWS = require("aws-sdk");
const casecontroller = require("./api/controllers/case");
const search = require("./api/controllers/search");
const organization = require("./api/controllers/organization");
const user = require("./api/controllers/user");
const bookmark = require("./api/controllers/bookmark");
const method = require("./api/controllers/method");
const errorhandler = require("errorhandler");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const cors = require("cors");
const isUser = require("./api/middleware/isUser");

const port = process.env.PORT || 3001;

AWS.config.update({ region: "us-east-1" });
app.use(compression());
app.set("port", port);
app.use(morgan("dev"));
app.use(methodOverride());
app.use(cors());
app.use(bodyParser.json());
app.use(
  jwt({
    secret: process.env.AUTH0_CLIENT_SECRET,
    credentialsRequired: false,
    algorithms: ["HS256"]
  }).unless({ method: ["OPTIONS", "GET"] })
);
app.use(express.static(path.join(__dirname, "swagger")));
app.use(errorhandler());

const cache = require("apicache").middleware;
// TODO Invalidate apicache on PUT/POST/DELETE using apicache.clear(req.params.collection);

app.use("/search", cache("5 minutes"), search);

app.use("/case", casecontroller);
app.use("/organization", organization);
app.use("/method", method);
app.use("/user", user);
app.use("/bookmark", bookmark);

app.use(
  "/s3/:path",
  jwt({
    secret: process.env.AUTH0_CLIENT_SECRET
  }),
  isUser
);
app.use(
  "/s3",
  require("react-dropzone-s3-uploader/s3router")({
    bucket: "uploads.participedia.xyz",
    region: "us-east-1", // optional
    headers: { "Access-Control-Allow-Origin": "*" }, // optional
    ACL: "private" // this is default
  })
);

module.exports = app;
