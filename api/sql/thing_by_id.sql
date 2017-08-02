WITH a2 AS (
    SELECT DISTINCT ON (authors.user_id)
      authors.user_id,
      authors.timestamp,
      users.name
    FROM
      authors,
      users
    WHERE
      authors.user_id = users.id AND
      authors.thingid = ${thingid}
    ORDER BY
      authors.user_id,
      authors.timestamp
),
 authors_list AS (
  SELECT
    array_agg((
      a2.user_id,
      a2.timestamp,
      a2.name
    )::author) authors
  FROM
    a2
),
full_thing AS (
  SELECT
    ${table:name}.*,
    COALESCE(location, '("","","","","","","","","")'::geolocation) AS location,
    COALESCE(images, '{}') AS images,
    COALESCE(${table:name}.files, '{}') files,
    COALESCE(${table:name}.videos, '{}') videos,
    COALESCE(${table:name}.tags, '{}') tags,
    COALESCE(${table:name}.links, '{}') links,
    localized_texts.body,
    localized_texts.title,
    authors_list.authors,
    get_related_nouns('case', ${type}, ${thingid}, ${lang} ) AS related_cases,
    get_related_nouns('method', ${type}, ${thingid}, ${lang} ) AS related_methods,
    get_related_nouns('organization', ${type}, ${thingid}, ${lang} ) AS related_organizations,
    bookmarked(${table:name}.type, ${thingid}, ${userId})
FROM
    ${table:name},
    localized_texts,
    authors_list
WHERE
    ${table:name}.id = localized_texts.thingid AND
    localized_texts.language = ${lang} AND
    ${table:name}.id = ${thingid}
)
SELECT to_json(full_thing.*) results FROM full_thing
;
