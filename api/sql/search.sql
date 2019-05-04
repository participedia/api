-- Parameters
-- query
-- language (defaults to 'en'
-- offset (defaults to 1)
-- limit (20 for now)
-- userid (may be null)
WITH all_selections AS (SELECT
  id,
  title,
  description,
  substring(body for 500) AS body,
  ts_rank_cd(search_index_${language:raw}.document, to_tsquery('english', ${query})) as rank
FROM search_index_${language:raw}
WHERE document @@ to_tsquery('english', ${query})
  ${filter:raw}
ORDER BY rank DESC
),
total_selections AS (
  SELECT count(all_selections.id) AS total
  FROM all_selections
)

SELECT
  things.id,
  things.type,
  things.featured,
  things.location_name,
  things.address1,
  things.address2,
  things.city,
  things.province,
  things.postal_code,
  things.country,
  things.latitude,
  things.longitude,
  all_selections.title,
  all_selections.description,
  all_selections.body,
  -- to_json(get_location(things.id)) AS location,
  to_json(COALESCE(things.photos, '{}')) AS photos,
  to_json(COALESCE(things.videos, '{}')) AS videos,
  things.updated_date,
  bookmarked(things.type, things.id, ${userId}),
  total_selections.total,
  all_selections.rank
FROM all_selections, total_selections, things
WHERE all_selections.id = things.id
ORDER BY all_selections.rank DESC
OFFSET ${offset}
LIMIT ${limit}
;
