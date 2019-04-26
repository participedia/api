const fs = require("fs");
const { mockRequest, mockResponse } = require("mock-req-res");
const {
  getCaseEditHttp,
  getCaseNewHttp,
  postCaseNewHttp,
  getCaseHttp,
  postCaseUpdateHttp
} = require("../../api/controllers/case");
const {
  getMethodHttp,
  getMethodEditHttp,
  getMethodNewHttp,
  postMethodNewHttp,
  postMethodUpdateHttp
} = require("../../api/controllers/method");
const {
  getOrganizationEditHttp,
  getOrganizationNewHttp,
  postOrganizationNewHttp,
  getOrganizationHttp,
  postOrganizationUpdateHttp
} = require("../../api/controllers/organization");

let example_case = JSON.parse(fs.readFileSync("test/data/case.json", "utf8"));
let example_method = JSON.parse(
  fs.readFileSync("test/data/method.json", "utf8")
);
let example_organization = JSON.parse(
  fs.readFileSync("test/data/organization.json", "utf8")
);
let mock_user = JSON.parse(fs.readFileSync("test/data/user.json", "utf8"));
let mock_user2 = JSON.parse(fs.readFileSync("test/data/user2.json", "utf8"));

async function getCase(id) {
  const { req, res, ret } = getMocks({ params: { thingid: id } });
  await getCaseHttp(req, res);
  return ret.body;
}

async function addBasicCase() {
  const { req, res, ret } = getMocks({
    user: mock_user,
    body: example_case,
    params: {}
  });
  await postCaseNewHttp(req, res);
  return ret.body;
}

async function updateCase(id, blob) {
  const { req, res, ret } = getMocksAuth({
    params: { thingid: id },
    body: blob
  });
  await postCaseUpdateHttp(req, res);
  return ret.body;
}

async function addBasicMethod() {
  const { req, res, ret } = getMocks({
    user: mock_user,
    body: example_method,
    params: {}
  });
  await postMethodNewHttp(req, res);
  return ret.body;
}

async function updateMethod(id, blob) {
  const { req, res, ret } = getMocks({
    params: { thingid: id }
  });
  await postMethodUpdateHttp(req, res);
  return ret.body;
}

async function getMethod(id) {
  const { req, res, ret } = getMocks({
    params: { thingid: id }
  });
  await getMethodHttp(req, res);
  return ret.body;
}

async function addBasicOrganization() {
  const { req, res, ret } = getMocks({
    user: mock_user,
    body: example_organization,
    params: {}
  });
  await postOrganizationNewHttp(req, res);
  return ret.body;
}

async function updateOrganization(id, blob) {
  const { req, res, ret } = getMocks({
    params: { thingid: id }
  });
  await postOrganizationUpdateHttp(req, res);
  return ret.body;
}

async function getOrganization(id) {
  const { req, res, ret } = getMocks({
    params: { thingid: id }
  });
  await getOrganizationHttp(req, res);
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
  return getMocks(Object.assign({ user: mock_user2 }, args || {}));
}

module.exports = {
  getMocks,
  getMocksAuth,
  example_case,
  example_method,
  example_organization,
  getCase,
  getMethod,
  getOrganization,
  addBasicCase,
  addBasicMethod,
  addBasicOrganization,
  updateCase,
  updateMethod,
  updateOrganization
};
