SELECT
    cases.id,
    'case' as type,
    to_json(get_location(things.id)) AS location,
    to_json(cases.photos) AS photos,
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
