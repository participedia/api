WITH full_thing AS (
  SELECT
    organizations.*,
    COALESCE(images, '{}') AS images,
    COALESCE(organizations.files, '{}') files,
    COALESCE(organizations.videos, '{}') videos,
    COALESCE(organizations.tags, '{}') tags,
    COALESCE(organizations.links, '{}') links,
    texts.body,
    texts.title,
    texts.description,
    first_author(${articleid}) AS creator,
    last_author(${articleid}) AS last_updated_by,
    bookmarked('organization', ${articleid}, ${userid})
FROM
    organizations,
    get_localized_texts(${articleid}, ${lang}) AS texts
WHERE
    organizations.id = ${articleid}
)
SELECT to_json(full_thing.*) results FROM full_thing
;
