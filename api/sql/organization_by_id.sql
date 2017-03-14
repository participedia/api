SELECT
    organizations.*,
    organization__localized_texts.*,
    to_json(author_list.authors)
FROM
    organizations,
    organization__localized_texts,
    (
        SELECT
            array_agg(ROW(
                organization__authors.user_id,
                organization__authors.timestamp,
                users.name
            )) authors,
            organization__authors.organization_id
        FROM
            organization__authors,
            users
        WHERE
            organization__authors.user_id = users.id
        GROUP BY
            organization__authors.organization_id
    ) AS author_list
WHERE
    organizations.id = organization__localized_texts.organization_id AND
    organization__localized_texts.language = ${lang} AND
    author_list.organization_id = organizations.id AND
    organizations.id = ${organizationId}
;
