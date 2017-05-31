UPDATE localized_texts
SET
  body = ${body},
  title = ${title},
  language = ${language},
  timestamp = VALUE 'now',
  ${type:raw}_id = ${id}
WHERE
  ${type:raw}_id = ${id} AND
  language = ${language}
;
