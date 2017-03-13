SELECT
    id,
    name
FROM
    users
WHERE
    users.id = $1
;


-- SELECT case__authors.case_id, title FROM case__localized_texts, case__authors WHERE author = $1 AND case__localized_texts.case_id = case__authors.case_id', userId),
-- t.any('SELECT method__authors.method_id, title FROM method__localized_texts, method__authors WHERE author = $1 AND method__localized_texts.method_id =  method__authors.method_id', userId),
-- t.any('SELECT organization__authors.organization_id, title FROM organization__localized_texts, organization__authors WHERE author_id = $1 AND organization__localized_texts.organization_id = organization__authors.organization_id', userId),
