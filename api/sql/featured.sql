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
    texts.title,
    texts.description,
    substring(texts.body for 500) AS body,
    location_name,
    address1,
    address2,
    city,
    province,
    postal_code,
    country,
    latitude,
    longitude,
    to_json(COALESCE(photos, '{}')) AS photos,
    to_json(COALESCE(videos, '{}')) as videos,
    updated_date,
    post_date,
    bookmarked(type, id, ${userId})
  FROM
    things,
    get_localized_texts(things.id, ${language}) AS texts
  WHERE things.hidden = false
        ${filter:raw}
  ORDER BY featured DESC, updated_date DESC
),
total_featured AS (
  SELECT count(all_featured.id) AS total
  FROM all_featured
)
SELECT all_featured.*, total_featured.total
FROM all_featured, total_featured
ORDER BY featured DESC, ${sortby:name} DESC
OFFSET ${offset}
LIMIT ${limit}
;
