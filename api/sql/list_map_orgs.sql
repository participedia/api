SELECT
    organizations.id,
    'organization' as type,
    to_json(organizations.location) AS location,
    to_json(organizations.lead_image) AS lead_image,
    organization__localized_texts.title AS title
FROM
    organizations,
    organization__localized_texts
WHERE
    organization__localized_texts.language = ${language} AND
    organization__localized_texts.organization_id = id
LIMIT ${limit}
OFFSET ${offset}
;
