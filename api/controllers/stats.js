"use strict";
const log = require("winston");
const { db, sql, as } = require("../helpers/db");
const fs = require("fs");

async function doit() {
  const tags = JSON.parse(fs.readFileSync("doc/tags.json")).tags;
  const dbtags = await db.any("select tags from things where tags is not null");
  const mungedtags = dbtags.map(taglist => taglist.tags.join(" "));
  tags.forEach(tag => {
    let matching = mungedtags.filter(
      tagstring => tagstring.toLowerCase().indexOf(tag.toLowerCase()) > -1
    );
    console.log("%s: %s", tag, matching.length);
  });
}

doit();
