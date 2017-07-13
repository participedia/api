SELECT
    organizations.id,
    'organization' as type,
    to_json(organizations.location) AS location,
    to_json(COALESCE(organizations.images, '{}')) AS images,
    localized_texts.title AS title
FROM
    organizations,
    localized_texts
WHERE
    localized_texts.language = ${language} AND
    localized_texts.thingid = id AND
    organizations.hidden = false
LIMIT ${limit}
OFFSET ${offset}
;
