SELECT
    methods.*,
    method__localized_texts.*,
    first.first_author,
    first.first_author_id,
    last.last_author,
    last.last_author_id
FROM
    methods,
    method__localized_texts,
    (
        SELECT
            users.name first_author,
            users.id first_author_id,
            methods.id method_id
        FROM
            users, methods
        WHERE
            methods.authors[1].user_id = users.id
    ) as first,
    (
        SELECT
            users.name last_author,
            users.id last_author_id,
            methods.id method_id
        FROM
            users, methods
        WHERE
            methods.authors[array_length(authors, 1)].user_id = users.id
    ) as last
WHERE
    methods.id = method__localized_texts.method_id AND
    method__localized_texts.language = ${lang} AND
    first.method_id = last.method_id AND
    first.method_id = methods.id AND
    methods.id = ${methodId}
;
