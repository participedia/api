SELECT title, case_id
FROM case__localized_texts
WHERE language = ${language}
ORDER BY case_id ASC
LIMIT ${limit}
OFFSET ${offset}
;
