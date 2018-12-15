WITH full_thing AS (
  SELECT
    methods.*,
    COALESCE(images, '{}') AS images,
    COALESCE(methods.files, '{}') files,
    COALESCE(methods.videos, '{}') videos,
    COALESCE(methods.tags, '{}') tags,
    COALESCE(methods.links, '{}') links,
    texts.body,
    texts.title,
    texts.description,
    first_author(${thingid}) AS creator,
    last_author(${thingid}) AS last_updated_by,
    bookmarked('method', ${thingid}, ${userid})
FROM
    methods,
    get_localized_texts(${thingid}, ${lang}) AS texts
WHERE
    methods.id = ${thingid}
)
SELECT to_json(full_thing.*) results FROM full_thing
;
