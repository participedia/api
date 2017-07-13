SELECT
    cases.id,
    'case' as type,
    to_json(cases.location) AS location,
    to_json(cases.images) AS images,
    localized_texts.title AS title
FROM
    cases,
    localized_texts
WHERE
    localized_texts.language = ${language} AND
    localized_texts.thingid = id AND
    cases.hidden = false
LIMIT ${limit}
OFFSET ${offset}
;
