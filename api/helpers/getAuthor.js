"use strict";
let AWS = require("aws-sdk");

function getLastThingByID(tableName, id, cb) {
  let docClient = new AWS.DynamoDB.DocumentClient();
  let params = {
    TableName: tableName,
    Limit: 1,
    ScanIndexForward: false, // this will return the last row with this id
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": String(id)
    }
  };
  docClient.query(params, cb);
}

function getAuthorByAuthorID(authorID, cb) {
  getLastThingByID("pp_users", authorID, cb);
}

module.exports = getAuthorByAuthorID;
