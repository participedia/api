WITH full_thing AS (
  SELECT
    ${table:name}.*,
    COALESCE(photos, '{}') AS photos,
    COALESCE(${table:name}.files, '{}') files,
    COALESCE(${table:name}.videos, '{}') videos,
    COALESCE(${table:name}.tags, '{}') tags,
    COALESCE(${table:name}.links, '{}') links,
    texts.body,
    texts.title,
    texts.description,
    first_author(${thingid}) AS creator,
    last_author(${thingid}) AS last_updated_by,
    bookmarked(${table:name}.type, ${thingid}, ${userId})
FROM
    ${table:name},
    get_localized_texts_fallback(${thingid}, ${lang}, ${table:name}.original_language) AS texts
WHERE
    ${table:name}.id = ${thingid}
)
SELECT to_json(full_thing.*) results FROM full_thing
;
