-- Parameters
-- query
-- language (defaults to 'en')
-- offset (defaults to 1)
-- limit (20 for now)
-- userid (may be null)
-- filter (only return results of *type*
WITH all_featured  AS (
  SELECT
    id,
    type,
    featured,
    title,
    substring(body for 500) AS body,
    to_json(COALESCE(location, '("","","","","","","","","")'::geolocation)) AS location,
    to_json(COALESCE(images, '{}')) AS images,
    to_json(COALESCE(videos, '{}')) as videos,
    updated_date,
    bookmarked(type, id, ${userId})
  FROM things, localized_texts
  WHERE things.id = localized_texts.thingid AND
        things.hidden = false AND
        localized_texts.language = ${language}
        ${filter:raw}
  ORDER BY featured DESC, updated_date DESC
),
total_featured AS (
  SELECT count(all_featured.id) AS total
  FROM all_featured
)
SELECT all_featured.*, total_featured.total
FROM all_featured, total_featured
OFFSET ${offset}
LIMIT ${limit}
;
