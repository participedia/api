const assert = require('assert');
const citation = require("../api/helpers/citation.js");

//Live testing:
let tokens = require("./setupenv");
let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiHelpers = require("./helpers");
let should = chai.should();
let expect = chai.expect;
chai.should();
chai.use(chaiHttp);
chai.use(chaiHelpers);
xmlParser = require('xml2js').parseString;

// condense a date string into just the year
function isolateYear(dateString) {
	return dateString.split('-')[0];
}

describe('Citation bodies', () => {
	let thingType = "case";
	let thingId = 1;
	let thingData = null;
	let url = "https://participedia.xyz/";
	it('should get a case successfully', async () => {
        const res = await chai.getJSON("/" + thingType + "/" + thingId).buffer().send({});
        res.should.have.status(200);
        thingData = res.body.data;
	});
    it('should be an aspa citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','apsa').buffer().send({});
        res.should.have.status(200);
        res.should.be.html;
        res.text.should.contain('Participedia contributors');
        res.text.should.contain(isolateYear(thingData.updated_date));
        res.text.should.contain(url + thingType + "/" + thingId);
    });
    it('should be an asa citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','asa').buffer().send({});
        res.should.have.status(200);
        res.should.be.html;
        res.text.should.contain('Participedia contributors');
        res.text.should.contain(isolateYear(thingData.updated_date));
        res.text.should.contain(url + thingType + "/" + thingId);
    });
    it('should be a chicago citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','chicago').buffer().send({});
        res.should.have.status(200);
        res.should.be.html;
        res.text.should.contain('Participedia contributors');
        res.text.should.contain(isolateYear(thingData.updated_date));
        res.text.should.contain(url + thingType + "/" + thingId);
    });
    it('should be an mhra citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','mhra').buffer().send({});
        res.should.have.status(200);
        res.should.be.html;
        res.text.should.contain('Participedia contributors');
        res.text.should.contain(isolateYear(thingData.updated_date));
        res.text.should.contain(url + thingType + "/" + thingId);
    });
    it('should be an nlm citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','nlm').buffer().send({});
        res.should.have.status(200);
        res.should.be.html;
        res.text.should.contain('Participedia contributors');
        res.text.should.contain(isolateYear(thingData.updated_date));
        res.text.should.contain(url + thingType + "/" + thingId);
    });
    it('should be a nature citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','nature').buffer().send({});
        res.should.have.status(200);
        res.should.be.html;
        res.text.should.contain('Participedia contributors');
        res.text.should.contain(isolateYear(thingData.updated_date));
        res.text.should.not.contain(url + thingType + "/" + thingId);
    });
    it('should be an ieee citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','ieee').buffer().send({});
        res.should.have.status(200);
        res.should.be.html;
        res.text.should.contain('Participedia contributors');
        res.text.should.contain(isolateYear(thingData.updated_date));
        res.text.should.not.contain(url + thingType + "/" + thingId);
    });
    it('should be an mla citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','mla').buffer().send({});
        res.should.have.status(200);
        res.should.be.html;
        res.text.should.contain('Participedia contributors');
        res.text.should.contain(isolateYear(thingData.updated_date));
        res.text.should.contain(url + thingType + "/" + thingId);
    });
    it('should be a vancouver1 citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','vancouver1').buffer().send({});
        res.should.have.status(200);
        res.should.be.html;
        res.text.should.contain('Participedia contributors');
        res.text.should.contain(isolateYear(thingData.updated_date));
        res.text.should.contain(url + thingType + "/" + thingId);
    });
    it('should be an apa citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','apa').buffer().send({});
        res.should.have.status(200);
        res.should.be.html;
        res.text.should.contain('Participedia contributors');
        res.text.should.contain(isolateYear(thingData.updated_date));
        res.text.should.contain(url + thingType + "/" + thingId);
    });
    it('should be a harvard1 citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','harvard1').buffer().send({});
        res.should.have.status(200);
        res.should.be.html;
        res.text.should.contain('Participedia contributors');
        res.text.should.contain(isolateYear(thingData.updated_date));
        res.text.should.contain(url + thingType + "/" + thingId);
    });
    it('should be an ads citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','ads').buffer().send({});
        res.should.have.status(200);
        res.should.be.text;
        res.text.should.contain('Participedia contributors');
        res.text.should.contain(isolateYear(thingData.updated_date));
        res.text.should.contain(url + thingType + "/" + thingId);
    });
    // file responses
    it('should be a BibTeX citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','bib').buffer().send({});
        res.should.have.status(200);
        res.text.should.contain('@Electronic{Participediacase1,');
        res.text.should.contain('author=\"{Participedia contributors}\"');
        res.text.should.contain('year=\"' + isolateYear(thingData.updated_date) + '\"');
    });
    it('should be an EndNote citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','end').buffer().send({});
        res.should.have.status(200);
        res.text.should.contain('%A Participedia contributors');
        res.text.should.contain('%D ' + isolateYear(thingData.updated_date));
        res.text.should.contain('%F Participediacase1');
    });
    it('should be an ISI citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','isi').buffer().send({});
        res.should.have.status(200);
        res.text.should.contain('AU Participedia contributors');
        res.text.should.contain('PY ' + isolateYear(thingData.updated_date));
        res.text.should.contain('ER');
    });
    it('should be an RIS citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','ris').buffer().send({});
        res.should.have.status(200);
        res.text.should.contain('AU  - Participedia contributors');
        res.text.should.contain('PY  - ' + isolateYear(thingData.updated_date));
        res.text.should.contain('ID  - Participediacase1');
    });
    it('should be a Word 2007 Bibliography citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','wordbib').buffer().send({});
        res.should.have.status(200);
        await xmlParser(res.text, (err, result) => {
          result["b:Sources"]["b:Source"][0]["b:Tag"][0].should.equal("Participediacase1");
          result["b:Sources"]["b:Source"][0]["b:SourceType"][0].should.equal("ElectronicSource");
          result["b:Sources"]["b:Source"][0]["b:Year"][0].should.equal(isolateYear(thingData.updated_date));
        });
    });
    it('should be a mods citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','xml').buffer().send({});
        res.should.have.status(200);
        await xmlParser(res.text, (err, result) => {
          result["modsCollection"]["mods"][0]["$"]["ID"].should.equal("Participediacase1");
          result["modsCollection"]["mods"][0]["name"][0]["namePart"][0].should.equal("Participedia contributors");
          result["modsCollection"]["mods"][0]["typeOfResource"][0].should.equal("software, multimedia");
        });
    });
    it('should be a csl citation', async () => {
        const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','csl').buffer().type("json").send({});
        res.should.have.status(200);
        res.body.type.should.equal('encyclopedia-entry');
        res.body.id.should.equal('Participediacase1');
        res.body["container-title"].should.equal('Participedia');
        res.body.author[0].literal.should.equal('Participedia contributors');
    });
});


let thingType = "citation";
let thingId = 1;
describe('Case Citations', () => {
    describe('citation headers', () => {
        it('invalid-format response', async () => {
            chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','fakeformat').buffer().send({}).end(function(err, res) {
                res.should.have.status(400);
            });
        });
        it('apsa response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','apsa').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('asa response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','asa').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('chicago response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','chicago').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('mhra response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','mhra').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('nlm response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','nlm').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('nature response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','nature').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('ieee response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','ieee').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('mla response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','mla').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('vancouver1 response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','vancouver1').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('apa response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','apa').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('harvard1 response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','harvard1').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('ads response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','ads').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/plain; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.ads"');
        });
        it('bib response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','bib').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/x-bibtex; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.bib"');
        });
        it('end response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','end').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/x-endnote-refer; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.end"');
        });
        it('isi response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','isi').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/x-inst-for-scientific-info; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.isi"');
        });
        it('ris response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','ris').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/x-research-info-systems; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.ris"');
        });
        it('wordbib response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','wordbib').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/xml; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.xml"');
        });
        it('xml response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','xml').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/mods+xml; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.xml"');
        });
        it('csl response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','csl').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/json; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.json"');
        });
    });
});

thingType = "method";
thingId = 145;
describe('Method Citations', () => {
    describe('citation headers', () => {
        it('invalid-format response', async () => {
            chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','fakeformat').buffer().send({}).end(function(err, res) {
                res.should.have.status(400);
            });
        });
        it('apsa response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','apsa').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('asa response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','asa').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('chicago response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','chicago').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('mhra response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','mhra').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('nlm response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','nlm').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('nature response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','nature').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('ieee response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','ieee').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('mla response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','mla').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('vancouver1 response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','vancouver1').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('apa response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','apa').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('harvard1 response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','harvard1').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('ads response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','ads').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/plain; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.ads"');
        });
        it('bib response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','bib').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/x-bibtex; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.bib"');
        });
        it('end response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','end').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/x-endnote-refer; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.end"');
        });
        it('isi response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','isi').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/x-inst-for-scientific-info; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.isi"');
        });
        it('ris response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','ris').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/x-research-info-systems; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.ris"');
        });
        it('wordbib response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','wordbib').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/xml; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.xml"');
        });
        it('xml response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','xml').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/mods+xml; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.xml"');
        });
        it('csl response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','csl').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/json; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.json"');
        });
    });
});

thingType = "organization";
thingId = 199;
describe('Organization Citations', () => {
    describe('citation headers', () => {
        it('invalid-format response', async () => {
            chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','fakeformat').buffer().send({}).end(function(err, res) {
                res.should.have.status(400);
            });
        });
        it('apsa response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','apsa').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('asa response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','asa').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('chicago response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','chicago').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('mhra response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','mhra').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('nlm response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','nlm').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('nature response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','nature').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('ieee response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','ieee').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('mla response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','mla').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('vancouver1 response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','vancouver1').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('apa response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','apa').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('harvard1 response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','harvard1').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/html; charset=utf-8');
        });
        it('ads response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','ads').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'text/plain; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.ads"');
        });
        it('bib response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','bib').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/x-bibtex; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.bib"');
        });
        it('end response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','end').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/x-endnote-refer; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.end"');
        });
        it('isi response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','isi').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/x-inst-for-scientific-info; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.isi"');
        });
        it('ris response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','ris').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/x-research-info-systems; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.ris"');
        });
        it('wordbib response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','wordbib').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/xml; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.xml"');
        });
        it('xml response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','xml').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/mods+xml; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.xml"');
        });
        it('csl response', async () => {
            const res = await chai.request(app).get("/citation/" + thingType + "/" + thingId).set('citation-format','csl').buffer().send({});
            res.should.have.status(200);
            res.should.have.header('Content-Type', 'application/json; charset=utf-8');
            // check response is a file
            res.should.have.header('Content-Disposition', 'inline; filename="' + thingType + '-' + thingId + '.json"');
        });
    });
});
