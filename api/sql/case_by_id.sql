SELECT
    cases.*,
    case__localized_texts.*,
    to_json(author_list.authors)
FROM
    cases,
    case__localized_texts,
    (
        SELECT
            array_agg(ROW(
                case__authors.user_id,
                case__authors.timestamp,
                users.name
            )) authors,
            case__authors.case_id
        FROM
            case__authors,
            users
        WHERE
            case__authors.user_id = users.id
        GROUP BY
            case__authors.case_id
    ) AS author_list
WHERE
    cases.id = case__localized_texts.case_id AND
    case__localized_texts.language = ${lang} AND
    author_list.case_id = cases.id AND
    cases.id = ${caseId}
;


-- SELECT case__methods.method_id, method__localized_texts.title FROM case__methods, method__localized_texts WHERE case__methods.case_id = ${caseId} AND case__methods.method_id = method__localized_texts.method_id;
