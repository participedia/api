const fs = require("fs");
const { mockRequest, mockResponse } = require("mock-req-res");
const { postCaseNewHttp } = require("../../api/controllers/case");

let example_case = JSON.parse(fs.readFileSync("test/data/case.json"));
let mock_user = JSON.parse(fs.readFileSync("test/data/user.json"));

async function addBasicCase() {
  const { req, res, ret } = getMocks({
    user: mock_user,
    body: example_case,
    params: {}
  });
  await postCaseNewHttp(req, res);
  return ret.body;
}

function getMocks(args) {
  const req = mockRequest(
    Object.assign({ query: { returns: "json" } }, args || {})
  );
  const ret = {};
  const res = mockResponse({
    json: body => {
      // console.log("json() called");
      ret.body = body;
    }
  });
  return { req, res, ret };
}

function getMocksAuth(args) {
  return getMocks(Object.assign({ user: mock_user }, args || {}));
}

module.exports = {
  getMocks,
  getMocksAuth,
  example_case,
  addBasicCase
};
