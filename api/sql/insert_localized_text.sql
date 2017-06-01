UPDATE localized_texts
SET
  body = ${body},
  title = ${title},
  language = ${language},
  timestamp = 'now',
  thingid = ${id}
WHERE
  thingid = ${id} AND
  language = ${language}
;
