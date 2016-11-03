'use strict'
var AWS = require("aws-sdk");

function getLastThingByID(tableName, id, cb) {
  var docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
      TableName : tableName,
      Limit : 1,
      ScanIndexForward: false, // this will return the last row with this id
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
          ":id": String(id)
      }
  };
  docClient.query(params, cb)
}

function getAuthorByAuthorID(authorID, cb) {
  getLastThingByID('pp_users', authorID, cb);
}

module.exports = getAuthorByAuthorID
