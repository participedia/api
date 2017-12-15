const assert = require('assert');
const data_converters = require('../api/helpers/data_converters.js');

//Tests for CSV converter

describe('CSV Converter', function(){

  describe('when escaping', function(){
    it('should return a plain string unchanged', function(){
      var strVal = "Plain String.";
      assert.equal(data_converters.escapeCSVCell(strVal), strVal);
    });

    it('should return numerical values as a string version of the value', function(){
      var intVal = 43;
      assert.equal(data_converters.escapeCSVCell(intVal), String(intVal));
    });

    it('should return negative numerical values as a string version of the value', function(){
      var intVal = -84;
      assert.equal(data_converters.escapeCSVCell(intVal), String(intVal));
    });

    it('should return boolean values as a string version of the value', function(){
      var boolVal = true;
      assert.equal(data_converters.escapeCSVCell(boolVal), String(boolVal));
    });

    it('should return null as empty string', function(){
      let nullVal = null;
      assert.equal(data_converters.escapeCSVCell(nullVal), "");
    });

    it('should return undefined as empty string', function(){
      let undefinedVal = undefined;
      assert.equal(data_converters.escapeCSVCell(undefinedVal), "");
    });

    it('should escape comma character', function(){
      var strWithComma = "Oh no, I dislike tests.";
      var strWithEscapedComma = "\"Oh no, I dislike tests.\"";
      assert.equal(data_converters.escapeCSVCell(strWithComma), strWithEscapedComma);
    });

    it('should escape comma character and escape double quotes that should be kept.', function(){
      var strWithComma = '\"Oh no, I dislike tests,\" she said.';
      var strWithEscapedComma = '\"\"\"Oh no, I dislike tests,\"\" she said.\"';
      assert.equal(data_converters.escapeCSVCell(strWithComma), strWithEscapedComma);
    });

    it('should escape pipe character', function(){
      var strWithPipe = "Look at my pipe | I like it";
      var strWithEscapedPipe = '\"Look at my pipe | I like it\"';
      assert.equal(data_converters.escapeCSVCell(strWithPipe), strWithEscapedPipe);
    });
  });

  describe('when formatting a list structure', function(){
    it('should give a single string with list elements separated by pipe characters (|)', function(){
      var list = ["ABC","DEF","GHI"];
      var expectedStr = 'ABC|DEF|GHI';
      assert.equal(data_converters.formatListStructure(list, 0), expectedStr);
    });

    it('should give a single string with numerical list elements separated by pipe characters (|)', function(){
      var list = [42,256,1048576];
      var expectedStr = '42|256|1048576';
      assert.equal(data_converters.formatListStructure(list, 0), expectedStr);
    });

    it('should give an empty string for an empty list', function(){
      var list = [];
      var expectedStr = "";
      assert.equal(data_converters.formatListStructure(list, 0), expectedStr);
    });

    it('should give an empty string in place of a null value in a list', function(){
      var list = ["First", null, "last"];
      var expectedStr = 'First||last';
      assert.equal(data_converters.formatListStructure(list, 0), expectedStr);
    });

    it('should respond well to a completely null list', function(){
      var list = [null, null, null];
      var expectedStr = '||';
      assert.equal(data_converters.formatListStructure(list, 0), expectedStr);
    });

    it('should escape any pipe characters pre-existing in the list', function(){
      var list = ["First", "Last|More Last"];
      var expectedStr = '\"First|\"\"Last|More Last\"\"\"';
      assert.equal(data_converters.formatListStructure(list, 0), expectedStr);
    });
  });

  describe('when formatting a list of objects', function(){
    it('should separate fields into individual consecutive lists', function(){
      var objList = [{a:"Hello", b:"There", c:"You!"}, {a:"Goodbye", b:"There", c:"Jim"}];
      var expectedStr = 'Hello|Goodbye,There|There,You!|Jim';
      assert.equal(data_converters.formatObjectList(objList, 0), expectedStr);
    });

    it('should work with numerical values.', function(){
      var objList = [{a:1, b:2, c:3}, {a:4, b:5, c:6}];
      var expectedStr = '1|4,2|5,3|6';
      assert.equal(data_converters.formatObjectList(objList, 0), expectedStr);
    });

    it('should work with null values', function(){
      var objList = [{a:null, b:null, c:null}, {a:null, b:null, c:null}];
      var expectedStr = '|,|,|';
      assert.equal(data_converters.formatObjectList(objList, 0), expectedStr);
    });

    it('should work with a mix of types', function(){
      var objList = [{a:"Hello", b:3, c:true}, {a:null, b:-42, c:false}];
      var expectedStr = 'Hello|,3|-42,true|false';
      assert.equal(data_converters.formatObjectList(objList, 0), expectedStr);
    });

    it('should escape any comma characters', function(){
      var objList = [{a:"Hello", b:3, c:"Words"}, {a:"Goodbye", b:-42, c:"and, More Words"}];
      var expectedStr = 'Hello|Goodbye,3|-42,\"Words|\"\"and, More Words\"\"\"';
      assert.equal(data_converters.formatObjectList(objList, 0), expectedStr);
    });

    it('should escape pipe characters', function(){
      var objList = [{a:"Hello|Greetings", b:3, c:true}, {a:"Goodbye|Cya later", b:-42, c:false}];
      var expectedStr = '\"\"\"Hello|Greetings\"\"|\"\"Goodbye|Cya later\"\"\",3|-42,true|false';
      assert.equal(data_converters.formatObjectList(objList, 0), expectedStr);
    });

    it('should escape a combination of commas and pipe characters', function(){
      var objList = [{a:"Hello", b:"A, B, and C", c:"Apples|Oranges"}, {a:"Goodbye|Cya", b:"DEF", c:"Melons, and Bananas"}];
      var expectedStr = '\"Hello|\"\"Goodbye|Cya\"\"\",\"\"\"A, B, and C\"\"|DEF\",\"\"\"Apples|Oranges\"\"|\"\"Melons, and Bananas\"\"\"';
      assert.equal(data_converters.formatObjectList(objList, 0), expectedStr);
    });
  });

  describe('when generating headers',function(){

    const template = {
      "foo":"string",
      "bar":["string"],
      "bat":{
        "bat1":"string",
        "bat2":"string"
      },
      "baz":[{
        "baz1":"string",
        "baz2":"string"
      }],
    };

    it('should cope with primitives, objects, and lists', function(){
      var headers = data_converters.createHeaderForCSV(template);
      var expected = 'foo,bar_list,bat_bat1,bat_bat2,baz_baz1_list,baz_baz2_list';
      assert.equal(headers, expected);
    });

  });

  describe('when generating an entire row',function(){

    const template = {
      "foo":"string",
      "bar":["string"],
      "bat":{
        "bat1":"string",
        "bat2":"string"
      },
      "baz":[{
        "baz1":"string",
        "baz2":"string"
      }],
    };

    it('should generate correctly for a simple object', function(){

      const obj = {
        "foo":"single Value",
        "bar":["list ele 1", "list ele 2", "list ele 3"],
        "bat":{
          "bat1":"Value inside object 1",
          "bat2":"Value inside object 2"
        },
        "baz":[
          {
            "baz1":"list obj 1 ele 1",
            "baz2":"list obj 1 ele 2"
          },
          {
            "baz1":"list obj 2 ele 1",
            "baz2":"list obj 2 ele 2"
          }
        ],
      };

      var dataRow = data_converters.convertToCSV(obj,"",template);
      var expected = 'single Value,list ele 1|list ele 2|list ele 3,Value inside object 1,Value inside object 2,list obj 1 ele 1|list obj 2 ele 1,list obj 1 ele 2|list obj 2 ele 2\n';
      assert.equal(dataRow, expected);
    });

    it('should generate correctly for an object with escape-needing characters', function(){

      const objWithBadCharacters = {
        "foo":"single Value",
        "bar":["list, ele 1", "list ele 2", "list| ele 3"],
        "bat":{
          "bat1":"Value inside, object 1",
          "bat2":"Value| inside object 2"
        },
        "baz":[
          {
            "baz1":"list obj 1, ele 1",
            "baz2":"list obj 1| ele 2"
          },
          {
            "baz1":"list obj 2\" ele 1",
            "baz2":"list obj 2, ele 2"
          }
        ],
      };

      var dataRow = data_converters.convertToCSV(objWithBadCharacters,"",template);
      var expected = 'single Value,\"\"\"list, ele 1\"\"|list ele 2|\"\"list| ele 3\"\"\",\"Value inside, object 1\",\"Value| inside object 2\",\"\"\"list obj 1, ele 1\"\"|\"\"list obj 2\"\"\"\" ele 1\"\"\",\"\"\"list obj 1| ele 2\"\"|\"\"list obj 2, ele 2\"\"\"\n';
      assert.equal(dataRow, expected);
    });

    it('should generate correctly by adding in columns for empty fields', function(){
      const objWithEmptyFields = {
        "foo":null,
        "bar":[],
        "bat":{},
        "baz":[],
      };
      var dataRow = data_converters.convertToCSV(objWithEmptyFields,"",template);
      var expected = ',,,,,\n';
      assert.equal(dataRow, expected);
    });

    it('should generate correctly by adding in columns for missing fields', function(){
      const objWithMissingFields = {};
      var dataRow = data_converters.convertToCSV(objWithMissingFields,"",template);
      var expected = ',,,,,\n';
      assert.equal(dataRow, expected);
    });

  });

});

describe('Object filter', function(){

  describe('with expected inputs', function(){

    describe('on a flat structure', function(){
      it('should filter correctly with a single filter', function(){
        obj = { a:"A", b:"B", c:"C", d:"D"};
        filter = { b:null };

        expectedObj = { a:"A", c:"C", d:"D" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });

      it('should filter correctly with multiple filters', function(){
        obj = { a:"A", b:"B", c:"C", d:"D" };
        filter = { b:null, d:null };

        expectedObj = { a:"A", c:"C" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });

      it('should filter correctly when filtering fields out of order', function(){
        obj = { a:"A", b:"B", c:"C" };
        filter = { c:null, a:null };

        expectedObj = { b:"B" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });
    });

    describe('on fields in an object', function(){
      it('should filter correctly with single filter', function(){
        obj = { a:"A", b:{ c:"C", d:"D" } };
        filter = { b:{d:null} };

        expectedObj = { a:"A", b:{ c:"C" } };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });

      it('should filter correctly with multiple filters', function(){
        obj = { a:"A", b:{ c:"C", d:"D", e:"E" } };
        filter = { b:{ c:null, d:null } };

        expectedObj = { a:"A", b:{ e:"E" } };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });

      it('should filter correctly when removing an object', function(){
        obj = { a:"A", b:{ c:"C", d:"D" } };
        filter = { b:null };

        expectedObj = { a:"A" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });
    });

    describe('on list fields', function(){
      it('should filter correctly', function(){
        obj = { a:"A", b:["B", "BE", "BEE"] };
        filter = { b:null };

        expectedObj = { a:"A" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });
    });

    describe('on fields in an object list', function(){
      it('should filter correctly with a single filter', function(){
        obj = { a:"A", b:[{ c:"C", d:"D" }, { c:"C", d:"D" }] };
        filter = { b:{ d:null } };

        expectedObj = { a:"A", b:[{ c:"C" }, { c:"C" }] };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });

      it('should filter correctly with multiple filters', function(){
        obj = { a:"A", b:[{ c:"C", d:"D", e:"E" }, { c:"C", d:"D", e:"E" }] };
        filter = { b:{ c:null, d:null } };

        expectedObj = { a:"A", b:[{ e:"E" }, { e:"E" }] };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });

      it('should filter correctly when removing the list', function(){
        obj = { a:"A", b:[{ c:"C", d:"D" }, { c:"C", d:"D" }] };
        filter = { b: null };

        expectedObj = { a:"A" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });
    });

  });

  describe('with incorrect/unexpected inputs', function(){
    it('should do nothing when filtering unused fields', function(){
        obj = { a:"A", b:"B", c:"C" };
        filter = { d:null };

        expectedObj = { a:"A", b:"B", c:"C" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
    });

    it('should filter correctly when filtering used and unused fields', function(){
        obj = { a:"A", b:"B", c:"C" };
        filter = { a:null, d:null };

        expectedObj = { b:"B", c:"C" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
    });

    it('should do nothing when filtering with an empty filter', function(){
        obj = { a:"A", b:"B", c:"C" };
        filter = {};

        expectedObj = { a:"A", b:"B", c:"C" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
    });

    it('should do nothing when filtering an empty object', function(){
        obj = {};
        filter = { a:null };

        expectedObj = {};
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
    });

    it('should do nothing when attempting to filter fields of a primitive', function(){
        obj = { a:"A" };
        filter = { a:{ b:null } };

        expectedObj = { a:"A" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
    });
  });

});

// Run XML based tests
describe('XML Conversion', function() {

  it('should enclose a data object in correct tag', function() {
    var opening = /<test>/;
    var closing = /<\/test>/;
    var obj = {foo:3};
    var returned = data_converters.convertToXML(obj, "test");
    assert(returned.match(opening));
    assert(returned.match(closing));
  });

  it('should enclose several objects in the correct wrapper tag', function() {
    var wrapperOpening = /<tests>/;
    var wrapperClosing = /<\/tests>/;
    assert(data_converters.getDataHeader("application/xml", true, "test").match(wrapperOpening));
    assert(data_converters.getDataFooter("application/xml", true, "test").match(wrapperClosing));
  });

  it('should generate correct XML values for object containing only primitives', function(){
    var obj = {foo:3};
    var expected = "<test>\n    <foo>3</foo>\n</test>";
    assert.equal(data_converters.convertToXML(obj, "test"), expected);
  });

  it('should give a doctype', function() {
    var doctype = /^<\?xml version='1\.0'\?>/;
    describe('when returning single thing', function() {
      assert(data_converters.getDataHeader("application/xml", false, "test").match(doctype));
    });
    describe('when returning multiple things', function() {
      assert(data_converters.getDataHeader("application/xml", true, "test").match(doctype));
    });
  });

  it('should not alter null values', function() {
    var obj = {foo:null};
    var expected = /<foo>null<\/foo>/;
    assert(data_converters.convertToXML(obj, "test").match(expected));
  });

  it('should escape special characters', function() {
    var obj = {foo:"<testchar"};
    var expected = /<foo>&lt;testchar<\/foo>/;
    var returned = data_converters.convertToXML(obj, "test");
    assert(returned.match(expected));
  });
});

describe('Live testing the API', () => {
  let tokens = require("./setupenv");
  let app = require("../app");
  let chai = require("chai");
  let chaiHttp = require("chai-http");
  let chaiHelpers = require("./helpers");
  let should = chai.should();
  let expect = chai.expect;
  let templates = require("../api/helpers/template");
  let csvParse = require('csv-parse');
  let xmlParse = require('xml2js').parseString;
  chai.should();
  chai.use(chaiHttp);
  chai.use(chaiHelpers);

  describe('and when requesting', () => {

    describe('a single unfiltered case', () => {
      it('should GET successfully in JSON format', (done) => {
        chai.request(app).get("/case/1")
          .set('accept', 'application/json')
          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res.body['OK']).to.equal(true);
            expect(res.body['data']['id']).to.equal(1);
            expect(res.body['data']['type']).to.equal('case');
            expect(res).to.have.header('content-type','application/json; charset=utf-8');
            expect(res).to.have.header('content-disposition','inline; filename=\"case-1.json\"');
            done();
        });
      });

      it('should GET successfully in CSV format', (done) => {
        chai.request(app).get("/case/1")
          .set('accept','text/csv')
          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res).to.have.header('content-type','text/csv; charset=utf-8');
            expect(res).to.have.header('content-disposition','inline; filename=\"case-1.csv\"');
            expect(res.text).to.match(/^id,/);
            expect(res.text).to.match(/\n1,/);
            expect(res.text).to.match(/,case,/);
            done();
        });
      });

      it('should GET successfully in XML format', (done) => {
        chai.request(app).get("/case/1")
          .set('accept','application/xml').buffer().type('xml')
          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res).to.have.header('content-type','application/xml');
            expect(res).to.have.header('content-disposition','inline; filename=\"case-1.xml\"');
            expect(res.text).to.match(/<id>1<\/id>/);
            expect(res.text).to.match(/<type>case<\/type>/);
            done();
        });
      });

    });

    describe('a single filtered case', () => {

      describe('with id to be filtered', () => {
        it('should GET JSON with id successfully filtered out', (done) => {
          chai.request(app).get("/case/1?filter={%22id%22%3Anull}")
            .set('accept', 'application/json')

            .end(function(err, res) {
              if (err) return done(err);
              res.should.have.status(200);
              expect(res.body['OK']).to.equal(true);
              expect(res.body['data']['id']).to.equal(undefined);
              expect(res).to.have.header('content-type','application/json; charset=utf-8');
              expect(res).to.have.header('content-disposition','inline; filename=\"case-1.json\"');
              done();
          });
        });

        it('should GET CSV with id successfully filtered out', (done) => {
          chai.request(app).get("/case/1?filter={%22id%22%3Anull}")
            .set('accept', 'text/csv')

            .end(function(err, res) {
              if (err) return done(err);
              res.should.have.status(200);
              expect(res).to.have.header('content-type','text/csv; charset=utf-8');
              expect(res).to.have.header('content-disposition','inline; filename=\"case-1.csv\"');
              expect(res.text).to.not.match(/^id,/);
              expect(res.text).to.not.match(/\n1,/);
              expect(res.text).to.match(/\ncase,/);
              done();
          });
        });

        it('should GET XML with id successfully filtered out', (done) => {
          chai.request(app).get("/case/1?filter={%22id%22%3Anull}")
            .set('accept', 'application/xml').buffer().type('xml')

            .end(function(err, res) {
              if (err) return done(err);
              res.should.have.status(200);
              expect(res).to.have.header('content-type','application/xml');
              expect(res).to.have.header('content-disposition','inline; filename=\"case-1.xml\"');
              expect(res.text).to.not.match(/<id>1<\/id>/);
              expect(res.text).to.match(/<type>case<\/type>/);
              done();
          });
        });
      });
    });

    describe('all unfiltered cases', () => {
      it('should GET successfully in JSON format', (done) => {
        chai.request(app).get("/case/all")
          .set('accept', 'application/json')
          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res.body['OK']).to.equal(true);
            // Should have more than one case
            expect(res.body['data']).to.have.lengthOf.above(1);
            expect(res.body['data'][0]['id']).to.equal(1);
            expect(res.body['data'][0]['type']).to.equal('case');
            expect(res.body['data'][1]['id']).to.equal(2);
            expect(res.body['data'][1]['type']).to.equal('case');
            expect(res).to.have.header('content-type','application/json; charset=utf-8');
            expect(res).to.have.header('content-disposition','inline; filename=\"case-all.json\"');
            done();
        });
      }).timeout(15000);

      it('should GET successfully in CSV format', (done) => {
        chai.request(app).get("/case/all")
          .set('accept','text/csv')
          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res).to.have.header('content-type','text/csv; charset=utf-8');
            expect(res).to.have.header('content-disposition','inline; filename=\"case-all.csv\"');
            //regex matching here would take a long time; parse it first.
            csvParse(res.text, function(err, objects){
              expect(objects[1][0]).to.equal("1");
              expect(objects[2][0]).to.equal("2");
              done();
            });
        });
      }).timeout(15000);

      it('should GET successfully in XML format', (done) => {
        chai.request(app).get("/case/all")
          .set('accept','application/xml').buffer().type('xml')
          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res).to.have.header('content-type','application/xml');
            expect(res).to.have.header('content-disposition','inline; filename=\"case-all.xml\"');
            expect(res.text).to.match(/<id>1<\/id>/);
            expect(res.text).to.match(/<id>2<\/id>/);
            expect(res.text).to.match(/<type>case<\/type>/);
            done();
        });
      }).timeout(15000);
    });

    describe('all filtered cases', () => {
      describe('with id to be filtered', () => {

        it('should GET JSON with id successfully filtered out', (done) => {
          chai.request(app).get("/case/all?filter={%22id%22%3Anull}")
            .set('accept', 'application/json')
            .end(function(err, res) {
              if (err) return done(err);
              res.should.have.status(200);
              expect(res.body['OK']).to.equal(true);
              expect(res.body['data'][0]['id']).to.equal(undefined);
              expect(res.body['data'][1]['id']).to.equal(undefined);
              expect(res).to.have.header('content-type','application/json; charset=utf-8');
              expect(res).to.have.header('content-disposition','inline; filename=\"case-all.json\"');
              done();
          });
        }).timeout(15000);

        it('should GET CSV with id successfully filtered out', (done) => {
          chai.request(app).get("/case/all?filter={%22id%22%3Anull}")
            .set('accept', 'text/csv')
            .end(function(err, res) {
              if (err) return done(err);
              res.should.have.status(200);
              expect(res).to.have.header('content-type','text/csv; charset=utf-8');
              expect(res).to.have.header('content-disposition','inline; filename=\"case-all.csv\"');
              csvParse(res.text, function(err, objects){
                expect(objects[1][0]).to.not.equal("1");
                expect(objects[2][0]).to.not.equal("2");
                done();
              });
          });
        }).timeout(15000);

        it('should GET XML with id successfully filtered out', (done) => {
          chai.request(app).get("/case/all?filter={%22id%22%3Anull}")
            .set('accept', 'application/xml').buffer().type('xml')

            .end(function(err, res) {
              if (err) return done(err);
              res.should.have.status(200);
              expect(res).to.have.header('content-type','application/xml');
              expect(res).to.have.header('content-disposition','inline; filename=\"case-all.xml\"');
              const objects = xmlParse(res.text, function(err, result) {
                expect(typeof result["cases"]["case"][0]).to.equal("object");
                expect(result["cases"]["case"][0]["id"]).to.equal(undefined);
                expect(typeof result["cases"]["case"][1]).to.equal("object");
                expect(result["cases"]["case"][1]["id"]).to.equal(undefined);
                done();
              });
          });
        }).timeout(15000);

      });
    });

    describe('the case template', () => {
      it('should be the same as internal template for case', (done) => {
        const template = templates.caseTemplate;
        chai.request(app).get("/case/template")
          .end(function(err, res) {
            expect(res.body["data"]).to.deep.equal(template);
            done();
        });
      });
    });
  });

  describe('a single unfiltered method', () => {
    it('should GET successfully in JSON format', (done) => {
      chai.request(app).get("/method/145")
        .set('accept', 'application/json')
        .end(function(err, res) {
          if (err) return done(err);
          res.should.have.status(200);
          expect(res.body['OK']).to.equal(true);
          expect(res.body['data']['id']).to.equal(145);
          expect(res.body['data']['type']).to.equal('method');
          expect(res).to.have.header('content-type','application/json; charset=utf-8');
          expect(res).to.have.header('content-disposition','inline; filename=\"method-145.json\"');
          done();
      });
    });

    it('should GET successfully in CSV format', (done) => {
      chai.request(app).get("/method/145")
        .set('accept','text/csv')
        .end(function(err, res) {
          if (err) return done(err);
          res.should.have.status(200);
          expect(res).to.have.header('content-type','text/csv; charset=utf-8');
          expect(res).to.have.header('content-disposition','inline; filename=\"method-145.csv\"');
          expect(res.text).to.match(/^id,/);
          expect(res.text).to.match(/\n145,/);
          expect(res.text).to.match(/,method,/);
          done();
      });
    });

    it('should GET successfully in XML format', (done) => {
      chai.request(app).get("/method/145")
        .set('accept','application/xml').buffer().type('xml')
        .end(function(err, res) {
          if (err) return done(err);
          res.should.have.status(200);
          expect(res).to.have.header('content-type','application/xml');
          expect(res).to.have.header('content-disposition','inline; filename=\"method-145.xml\"');
          expect(res.text).to.match(/<id>145<\/id>/);
          expect(res.text).to.match(/<type>method<\/type>/);
          done();
      });
    });

  });

  describe('a single filtered method', () => {

    describe('with id to be filtered', () => {
      it('should GET JSON with id successfully filtered out', (done) => {
        chai.request(app).get("/method/145?filter={%22id%22%3Anull}")
          .set('accept', 'application/json')

          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res.body['OK']).to.equal(true);
            expect(res.body['data']['id']).to.equal(undefined);
            expect(res).to.have.header('content-type','application/json; charset=utf-8');
            expect(res).to.have.header('content-disposition','inline; filename=\"method-145.json\"');
            done();
        });
      });

      it('should GET CSV with id successfully filtered out', (done) => {
        chai.request(app).get("/method/145?filter={%22id%22%3Anull}")
          .set('accept', 'text/csv')

          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res).to.have.header('content-type','text/csv; charset=utf-8');
            expect(res).to.have.header('content-disposition','inline; filename=\"method-145.csv\"');
            expect(res.text).to.not.match(/^id,/);
            expect(res.text).to.not.match(/\n145,/);
            expect(res.text).to.match(/\nmethod,/);
            done();
        });
      });

      it('should GET XML with id successfully filtered out', (done) => {
        chai.request(app).get("/method/145?filter={%22id%22%3Anull}")
          .set('accept', 'application/xml').buffer().type('xml')

          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res).to.have.header('content-type','application/xml');
            expect(res).to.have.header('content-disposition','inline; filename=\"method-145.xml\"');
            expect(res.text).to.not.match(/<id>145<\/id>/);
            expect(res.text).to.match(/<type>method<\/type>/);
            done();
        });
      });
    });
  });

  describe('all unfiltered methods', () => {
    it('should GET successfully in JSON format', (done) => {
      chai.request(app).get("/method/all")
        .set('accept', 'application/json')
        .end(function(err, res) {
          if (err) return done(err);
          res.should.have.status(200);
          expect(res.body['OK']).to.equal(true);
          // Should have more than one method
          expect(res.body['data']).to.have.lengthOf.above(1);
          expect(res.body['data'][0]['id']).to.equal(145);
          expect(res.body['data'][0]['type']).to.equal('method');
          expect(res.body['data'][1]['id']).to.equal(146);
          expect(res.body['data'][1]['type']).to.equal('method');
          expect(res).to.have.header('content-type','application/json; charset=utf-8');
          expect(res).to.have.header('content-disposition','inline; filename=\"method-all.json\"');
          done();
      });
    }).timeout(15000);

    it('should GET successfully in CSV format', (done) => {
      chai.request(app).get("/method/all")
        .set('accept','text/csv')
        .end(function(err, res) {
          if (err) return done(err);
          res.should.have.status(200);
          expect(res).to.have.header('content-type','text/csv; charset=utf-8');
          expect(res).to.have.header('content-disposition','inline; filename=\"method-all.csv\"');
          //regex matching here would take a long time; parse it first.
          csvParse(res.text, function(err, objects){
            expect(objects[1][0]).to.equal('145');
            expect(objects[2][0]).to.equal('146');
            done();
          });
      });
    }).timeout(15000);

    it('should GET successfully in XML format', (done) => {
      chai.request(app).get("/method/all")
        .set('accept','application/xml').buffer().type('xml')
        .end(function(err, res) {
          if (err) return done(err);
          res.should.have.status(200);
          expect(res).to.have.header('content-type','application/xml');
          expect(res).to.have.header('content-disposition','inline; filename=\"method-all.xml\"');
          expect(res.text).to.match(/<id>145<\/id>/);
          expect(res.text).to.match(/<id>146<\/id>/);
          expect(res.text).to.match(/<type>method<\/type>/);
          done();
      });
    }).timeout(15000);
  });

  describe('all filtered methods', () => {
    describe('with id to be filtered', () => {

      it('should GET JSON with id successfully filtered out', (done) => {
        chai.request(app).get("/method/all?filter={%22id%22%3Anull}")
          .set('accept', 'application/json')
          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res.body['OK']).to.equal(true);
            expect(res.body['data'][0]['id']).to.equal(undefined);
            expect(res.body['data'][1]['id']).to.equal(undefined);
            expect(res).to.have.header('content-type','application/json; charset=utf-8');
            expect(res).to.have.header('content-disposition','inline; filename=\"method-all.json\"');
            done();
        });
      }).timeout(15000);

      it('should GET CSV with id successfully filtered out', (done) => {
        chai.request(app).get("/method/all?filter={%22id%22%3Anull}")
          .set('accept', 'text/csv')
          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res).to.have.header('content-type','text/csv; charset=utf-8');
            expect(res).to.have.header('content-disposition','inline; filename=\"method-all.csv\"');
            csvParse(res.text, function(err, objects){
              expect(objects[1][0]).to.not.equal("145");
              expect(objects[2][0]).to.not.equal("146");
              done();
            });
        });
      }).timeout(15000);

      it('should GET XML with id successfully filtered out', (done) => {
        chai.request(app).get("/method/all?filter={%22id%22%3Anull}")
          .set('accept', 'application/xml').buffer().type('xml')

          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res).to.have.header('content-type','application/xml');
            expect(res).to.have.header('content-disposition','inline; filename=\"method-all.xml\"');
            const objects = xmlParse(res.text, function(err, result) {
              expect(typeof result["methods"]["method"][0]).to.equal("object");
              expect(result["methods"]["method"][0]["id"]).to.equal(undefined);
              expect(typeof result["methods"]["method"][1]).to.equal("object");
              expect(result["methods"]["method"][1]["id"]).to.equal(undefined);
              done();
            });
        });
      }).timeout(15000);

    });
  });

  describe('the method template', () => {
    it('should be the same as internal template for method', (done) => {
      const template = templates.methodTemplate;
      chai.request(app).get("/method/template")
        .end(function(err, res) {
          expect(res.body["data"]).to.deep.equal(template);
          done();
      });
    });
  });

  describe('a single unfiltered organization', () => {
    it('should GET successfully in JSON format', (done) => {
      chai.request(app).get("/organization/199")
        .set('accept', 'application/json')
        .end(function(err, res) {
          if (err) return done(err);
          res.should.have.status(200);
          expect(res.body['OK']).to.equal(true);
          expect(res.body['data']['id']).to.equal(199);
          expect(res.body['data']['type']).to.equal('organization');
          expect(res).to.have.header('content-type','application/json; charset=utf-8');
          expect(res).to.have.header('content-disposition','inline; filename=\"organization-199.json\"');
          done();
      });
    });

    it('should GET successfully in CSV format', (done) => {
      chai.request(app).get("/organization/199")
        .set('accept','text/csv')
        .end(function(err, res) {
          if (err) return done(err);
          res.should.have.status(200);
          expect(res).to.have.header('content-type','text/csv; charset=utf-8');
          expect(res).to.have.header('content-disposition','inline; filename=\"organization-199.csv\"');
          expect(res.text).to.match(/^id,/);
          expect(res.text).to.match(/\n199,/);
          expect(res.text).to.match(/,organization,/);
          done();
      });
    });

    it('should GET successfully in XML format', (done) => {
      chai.request(app).get("/organization/199")
        .set('accept','application/xml').buffer().type('xml')
        .end(function(err, res) {
          if (err) return done(err);
          res.should.have.status(200);
          expect(res).to.have.header('content-type','application/xml');
          expect(res).to.have.header('content-disposition','inline; filename=\"organization-199.xml\"');
          expect(res.text).to.match(/<id>199<\/id>/);
          expect(res.text).to.match(/<type>organization<\/type>/);
          done();
      });
    });

  });

  describe('a single filtered organization', () => {

    describe('with id to be filtered', () => {
      it('should GET JSON with id successfully filtered out', (done) => {
        chai.request(app).get("/organization/199?filter={%22id%22%3Anull}")
          .set('accept', 'application/json')

          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res.body['OK']).to.equal(true);
            expect(res.body['data']['id']).to.equal(undefined);
            expect(res).to.have.header('content-type','application/json; charset=utf-8');
            expect(res).to.have.header('content-disposition','inline; filename=\"organization-199.json\"');
            done();
        });
      });

      it('should GET CSV with id successfully filtered out', (done) => {
        chai.request(app).get("/organization/199?filter={%22id%22%3Anull}")
          .set('accept', 'text/csv')

          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res).to.have.header('content-type','text/csv; charset=utf-8');
            expect(res).to.have.header('content-disposition','inline; filename=\"organization-199.csv\"');
            expect(res.text).to.not.match(/^id,/);
            expect(res.text).to.not.match(/\n199,/);
            expect(res.text).to.match(/\norganization,/);
            done();
        });
      });

      it('should GET XML with id successfully filtered out', (done) => {
        chai.request(app).get("/organization/199?filter={%22id%22%3Anull}")
          .set('accept', 'application/xml').buffer().type('xml')

          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res).to.have.header('content-type','application/xml');
            expect(res).to.have.header('content-disposition','inline; filename=\"organization-199.xml\"');
            expect(res.text).to.not.match(/<id>199<\/id>/);
            expect(res.text).to.match(/<type>organization<\/type>/);
            done();
        });
      });
    });
  });

  describe('all unfiltered organizations', () => {
    it('should GET successfully in JSON format', (done) => {
      chai.request(app).get("/organization/all")
        .set('accept', 'application/json')
        .end(function(err, res) {
          if (err) return done(err);
          res.should.have.status(200);
          expect(res.body['OK']).to.equal(true);
          // Should have more than one organization
          expect(res.body['data']).to.have.lengthOf.above(1);
          expect(res.body['data'][0]['id']).to.equal(199);
          expect(res.body['data'][0]['type']).to.equal('organization');
          expect(res.body['data'][1]['id']).to.equal(200);
          expect(res.body['data'][1]['type']).to.equal('organization');
          expect(res).to.have.header('content-type','application/json; charset=utf-8');
          expect(res).to.have.header('content-disposition','inline; filename=\"organization-all.json\"');
          done();
      });
    }).timeout(15000);

    it('should GET successfully in CSV format', (done) => {
      chai.request(app).get("/organization/all")
        .set('accept','text/csv')
        .end(function(err, res) {
          if (err) return done(err);
          res.should.have.status(200);
          expect(res).to.have.header('content-type','text/csv; charset=utf-8');
          expect(res).to.have.header('content-disposition','inline; filename=\"organization-all.csv\"');
          //regex matching here would take a long time; parse it first.
          csvParse(res.text, function(err, objects){
            expect(objects[1][0]).to.equal('199');
            expect(objects[2][0]).to.equal('200');
            done();
          });
      });
    }).timeout(15000);

    it('should GET successfully in XML format', (done) => {
      chai.request(app).get("/organization/all")
        .set('accept','application/xml').buffer().type('xml')
        .end(function(err, res) {
          if (err) return done(err);
          res.should.have.status(200);
          expect(res).to.have.header('content-type','application/xml');
          expect(res).to.have.header('content-disposition','inline; filename=\"organization-all.xml\"');
          expect(res.text).to.match(/<id>199<\/id>/);
          expect(res.text).to.match(/<id>200<\/id>/);
          expect(res.text).to.match(/<type>organization<\/type>/);
          done();
      });
    }).timeout(15000);
  });

  describe('all filtered organizations', () => {
    describe('with id to be filtered', () => {

      it('should GET JSON with id successfully filtered out', (done) => {
        chai.request(app).get("/organization/all?filter={%22id%22%3Anull}")
          .set('accept', 'application/json')
          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res.body['OK']).to.equal(true);
            expect(res.body['data'][0]['id']).to.equal(undefined);
            expect(res.body['data'][1]['id']).to.equal(undefined);
            expect(res).to.have.header('content-type','application/json; charset=utf-8');
            expect(res).to.have.header('content-disposition','inline; filename=\"organization-all.json\"');
            done();
        });
      }).timeout(15000);

      it('should GET CSV with id successfully filtered out', (done) => {
        chai.request(app).get("/organization/all?filter={%22id%22%3Anull}")
          .set('accept', 'text/csv')
          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res).to.have.header('content-type','text/csv; charset=utf-8');
            expect(res).to.have.header('content-disposition','inline; filename=\"organization-all.csv\"');
            csvParse(res.text, function(err, objects){
              expect(objects[1][0]).to.not.equal("199");
              expect(objects[2][0]).to.not.equal("200");
              done();
            });
        });
      }).timeout(15000);

      it('should GET XML with id successfully filtered out', (done) => {
        chai.request(app).get("/organization/all?filter={%22id%22%3Anull}")
          .set('accept', 'application/xml').buffer().type('xml')

          .end(function(err, res) {
            if (err) return done(err);
            res.should.have.status(200);
            expect(res).to.have.header('content-type','application/xml');
            expect(res).to.have.header('content-disposition','inline; filename=\"organization-all.xml\"');
            const objects = xmlParse(res.text, function(err, result) {
              expect(typeof result["organizations"]["organization"][0]).to.equal("object");
              expect(result["organizations"]["organization"][0]["id"]).to.equal(undefined);
              expect(typeof result["organizations"]["organization"][1]).to.equal("object");
              expect(result["organizations"]["organization"][1]["id"]).to.equal(undefined);
              done();
            });
        });
      }).timeout(15000);

    });
  });

  describe('getting template', () => {
    it('should be the same as internal template for organization', (done) => {
      const template = templates.organizationTemplate;
      chai.request(app).get("/organization/template")
        .end(function(err, res) {
          expect(res.body["data"]).to.deep.equal(template);
          done();
      });
    });
  });
});
