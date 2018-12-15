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
    first_author(${thingid}) AS creator,
    last_author(${thingid}) AS last_updated_by,
    bookmarked('organization', ${thingid}, ${userid})
FROM
    organizations,
    get_localized_texts(${thingid}, ${lang}) AS texts
WHERE
    organizations.id = ${thingid}
)
SELECT to_json(full_thing.*) results FROM full_thing
;
