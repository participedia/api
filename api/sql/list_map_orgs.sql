SELECT
    organizations.id,
    'organization' as type,
    to_json(organizations.location) AS location,
    to_json(organizations.lead_image) AS lead_image,
    localized_texts.title AS title
FROM
    organizations,
    localized_texts
WHERE
    localized_texts.language = ${language} AND
    localized_texts.thingid = id
LIMIT ${limit}
OFFSET ${offset}
;
