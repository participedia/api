SELECT title, organization_id
FROM organization__localized_texts
WHERE language = ${language}
ORDER BY organization_id ASC
LIMIT ${limit}
OFFSET ${offset}
;
