SELECT
    methods.*,
    method__localized_texts.*,
    to_json(author_list.authors)
FROM
    methods,
    method__localized_texts,
    (
        SELECT
            array_agg(ROW(
                method__authors.user_id,
                method__authors.timestamp,
                users.name
            )) authors,
            method__authors.method_id
        FROM
            method__authors,
            users
        WHERE
            method__authors.user_id = users.id
        GROUP BY
            method__authors.method_id
    ) AS author_list
WHERE
    methods.id = method__localized_texts.method_id AND
    method__localized_texts.language = ${lang} AND
    author_list.method_id = methods.id AND
    methods.id = ${methodId}
;
