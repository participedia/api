SELECT
    id,
    type,
    original_language,
    executive_director,
    issue,
    post_date,
    published,
    sector,
    updated_date,
    location,
    lead_image,
    other_images,
    files,
    videos,
    tags,
    title,
    body,
    authors
FROM
    (
        SELECT
            organizations.id,
            'organization' as type,
            organizations.original_language,
            organizations.executive_director,
            organizations.issue,
            organizations.post_date,
            organizations.published,
            organizations.sector,
            organizations.updated_date,
            to_json(organizations.location) AS location,
            to_json(organizations.lead_image) AS lead_image,
            to_json(COALESCE(organizations.other_images, '{}')) AS other_images,
            to_json(COALESCE(organizations.files, '{}')) AS files,
            to_json(COALESCE(organizations.videos, '{}')) AS videos,
            to_json(COALESCE(organizations.tags, '{}')) AS tags,
            organization__localized_texts.*,
            to_json(author_list.authors) AS authors,
            setweight(to_tsvector(coalesce(organizations.original_language, '')), 'C') ||
            setweight(to_tsvector(coalesce(organizations.executive_director, '')), 'B') ||
            setweight(to_tsvector(coalesce(organizations.issue, '')), 'B') ||
            setweight(to_tsvector(coalesce(organizations.sector, '')), 'B') ||
            setweight(to_tsvector(coalesce(organization__localized_texts.title, '')), 'A') ||
            setweight(to_tsvector(coalesce(organization__localized_texts.body, '')), 'A') as document
        FROM
            organizations,
            organization__localized_texts,
            (
                SELECT
                    array_agg(CAST(ROW(
                        organization__authors.user_id,
                        organization__authors.timestamp,
                        users.name
                    ) AS author )) authors,
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
            organization__localized_texts.language = ${language} AND
            ${facets:raw}
            author_list.organization_id = organizations.id
    ) as docsearch
WHERE
    docsearch.document @@ to_tsquery(${query})
ORDER BY
    ts_rank(docsearch.document, to_tsquery(${query})) DESC
LIMIT ${limit}
OFFSET ${offset}
;
