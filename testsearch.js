var AWS = require("aws-sdk");
var async = require('async');

AWS.config.update({
  profile: "ppadmin",
  region: "us-east-1"
});

function getLastThingByID(tableName, id, cb) {
  console.log('doing getLastThingByID')
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
  console.log("params", params)
  docClient.query(params, cb)
}

async.parallel([
  function () {
    getLastThingByID('pp_users', 176503, function(err, ret) {
      console.log("ERR:", err);
      console.log("ret:", ret);
    })
  }
], function(){});

