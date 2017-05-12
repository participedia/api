UPDATE ${type:raw}__localized_texts
SET
  body = ${body},
  title = ${title},
  language = ${language},
  ${type:raw}_id = ${id}
WHERE
  ${type:raw}_id = ${id} AND
  language = ${language}
;
