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
    to_json(author_list.authors) AS authors
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
    organization__localized_texts.language = ${lang} AND
    author_list.organization_id = organizations.id AND
    organizations.id = ${organizationId}
;
