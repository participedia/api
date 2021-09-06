"use strict";
const app = require("express");
const api = app.Router();
api.get("/", async function(req, res) {
    return 'Working';
})

api.use('/v1', api); 

module.exports = api;

