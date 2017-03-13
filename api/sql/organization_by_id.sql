SELECT
    organizations.*,
    organization__localized_texts.*,
    first.first_author,
    first.first_author_id,
    last.last_author,
    last.last_author_id
FROM
    organizations,
    organization__localized_texts,
    (
        SELECT
            users.name first_author,
            users.id first_author_id,
            organizations.id organization_id
        FROM
            users, organizations
        WHERE
            organizations.authors[1].user_id = users.id
    ) as first,
    (
        SELECT
            users.name last_author,
            users.id last_author_id,
            organizations.id organization_id
        FROM
            users, organizations
        WHERE
            organizations.authors[array_length(authors, 1)].user_id = users.id
    ) as last
WHERE
    organizations.id = organization__localized_texts.organization_id AND
    organization__localized_texts.language = ${lang} AND
    first.organization_id = last.organization_id AND
    first.organization_id = organizations.id AND
    organizations.id = ${organizationId}
;
