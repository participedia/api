"use strict";
const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const cache = require("apicache");
const log = require("winston");

const { returnCitation } = require("../helpers/citation");

/**
 * @api {get} /citation/:thingtype/:thingid
 * Get the citation for a given thing in a given format
 * @apiGroup Citation
 * @apiVersion 0.1.0
 * @apiName Citation
 * @apiParam {String} thingtype Type of thing (case|method|organization)
 * @apiParam {Number} thingid ID of thing
 * @apiHeader {String} citation-format Format of citation.
 *    If unset, list of all possible formats is returned (as error 400).
 * @apiHeader {String} accept Ignored unless `citation-format` header is one of
 *    [apsa,asa,chicago,mhra,nlm,nature,ieee,mla,vancouver1,apa,harvard1].
 *    Changes content type of human readable citations.
 *    Accepted values: `text/html`, `text/plain`.
 *
 * @apiSuccessExample {bib} (bib) BibTeX success:
 *     HTTP/1.1 200 OK
 *     content-disposition: attachment; filename="case-1.bib"
 *     content-type: application/x-bibtex; charset=utf-8
 *
 *     \@Electronic{Participediacase1,
 *     author="{Participedia contributors}",
 *     title="British Columbia Citizens' Assembly on Electoral Reform",
 *     year="2016",
 *     month="May",
 *     day="21",
 *     url="https://participedia.xyz/case/1"
 *     }
 *
 * @apiSuccessExample {ris} (ris) RIS success:
 *     HTTP/1.1 200 OK
 *     content-disposition: attachment; filename="case-1.ris"
 *     content-type: application/x-research-info-systems; charset=utf-8
 *
 *     TY  - ELEC
 *     AU  - Participedia contributors
 *     PY  - 2016
 *     DA  - 2016/05/21
 *     TI  - British Columbia Citizens' Assembly on Electoral Reform
 *     UR  - https://participedia.xyz/case/1
 *     ID  - Participediacase1
 *     ER  -
 *
 * @apiSuccessExample {csl} (csl) CSL success:
 *     HTTP/1.1 200 OK
 *     content-disposition: attachment; filename="case-1.json"
 *     content-type: application/json; charset=utf-8
 *
 *     {"type":"encyclopedia-entry","id":"Participediacase1","title":"British Columbia Citizens' Assembly on Electoral Reform","container-title":"Participedia","author":[{"literal":"Participedia contributors"}],"URL":"https://participedia.xyz/case/1","accessed":{"date-parts":[[2017,12,14]]},"issued":{"date-parts":[[2016,5,21]]}}
 *
 * @apiSuccessExample {end} (end) EndNote success:
 *     HTTP/1.1 200 OK
 *     content-disposition: attachment; filename="case-1.end"
 *     content-type: application/x-endnote-refer; charset=utf-8
 *
 *     %0 Computer Program
 *     %T British Columbia Citizens' Assembly on Electoral Reform
 *     %A Participedia contributors
 *     %D 2016
 *     %8 May 21
 *     %F Participediacase1
 *     %U https://participedia.xyz/case/1
 *
 * @apiSuccessExample {end} (apa) APA success (
 *     HTTP/1.1 200 OK
 *
 *     Participedia contributors. (2016, May 21). British Columbia Citizens’ Assembly on Electoral Reform. <i>Participedia</i>. Retrieved from https://participedia.xyz/case/1
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */

router.get("/:thingtype(case|method|organization)/:thingid", (req, res, next) => returnCitation(req, res, next));

module.exports = router;
