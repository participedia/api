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
    organizations.featured,
    to_json(COALESCE(organizations.links, '{}')) AS links,
    localized_texts.body,
    localized_texts.title,
    to_json(author_list.authors) AS authors
FROM
    organizations,
    localized_texts,
    (
        SELECT
            array_agg(CAST(ROW(
                authors.user_id,
                authors.timestamp,
                users.name
            ) AS author )) authors,
            authors.thingid
        FROM
            authors,
            users
        WHERE
            authors.user_id = users.id
        GROUP BY
            authors.thingid
    ) AS author_list
WHERE
    organizations.id = localized_texts.thingid AND
    localized_texts.language = ${language} AND
    ${facets:raw}
    author_list.thingid = organizations.id
${order_by:raw}
LIMIT ${limit}
OFFSET ${offset}
;
