SELECT
    cases.id,
    'case' as type,
    to_json(cases.location) AS location,
    to_json(cases.lead_image) AS lead_image,
    case__localized_texts.title AS title
FROM
    cases,
    case__localized_texts
WHERE
    case__localized_texts.language = ${language} AND
    case__localized_texts.case_id = id    
LIMIT ${limit}
OFFSET ${offset}
;
