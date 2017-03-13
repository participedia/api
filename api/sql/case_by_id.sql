SELECT
    cases.*,
    case__localized_texts.*,
    first.first_author,
    first.first_author_id,
    last.last_author,
    last.last_author_id
FROM
    cases,
    case__localized_texts,
    (
        SELECT
            users.name first_author,
            users.id first_author_id,
            cases.id case_id
        FROM
            users, cases
        WHERE
            cases.authors[1].user_id = users.id
    ) as first,
    (
        SELECT
            users.name last_author,
            users.id last_author_id,
            cases.id case_id
        FROM
            users, cases
        WHERE
            cases.authors[array_length(authors, 1)].user_id = users.id
    ) as last
WHERE
    cases.id = case__localized_texts.case_id AND
    case__localized_texts.language = ${lang} AND
    first.case_id = last.case_id AND
    first.case_id = cases.id AND
    cases.id = ${caseId}
;


-- SELECT case__methods.method_id, method__localized_texts.title FROM case__methods, method__localized_texts WHERE case__methods.case_id = ${caseId} AND case__methods.method_id = method__localized_texts.method_id;
