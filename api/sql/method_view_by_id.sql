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
    first_author(${articleid}) AS creator,
    last_author(${articleid}) AS last_updated_by,
    bookmarked('method', ${articleid}, ${userid})
FROM
    methods,
    get_localized_texts(${articleid}, ${lang}) AS texts
WHERE
    methods.id = ${articleid}
)
SELECT to_json(full_thing.*) results FROM full_thing
;
