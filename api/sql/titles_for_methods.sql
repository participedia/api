SELECT title, method_id
FROM method__localized_texts
WHERE language = ${language}
ORDER BY method_id ASC
LIMIT ${limit}
OFFSET ${offset}
;
