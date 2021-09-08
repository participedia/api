"use strict";
const app = require("express");
const api = app.Router();
const {
    listCases,
    listMethods,
    listOrganizations,
} = require("../../helpers/db");

const {
    parseAPIGetParams,
} = require("./api-things");   

api.use('/v1', api); 
api.get("/", async function(req, res) {

    res.status(200).json({});
})

api.get("/cases", async function(req, res) {
    const params = parseAPIGetParams(req);
    if(params.error) {
        return res.status(400).json({
            error: params.error,
        });
    }
    const cases = listCases('en');
    res.status(200).json({
        OK: true,
        cases,
    });
})
module.exports = api;

