-- Parameters
-- query
-- language (defaults to 'en'
-- offset (defaults to 1)
-- limit (20 for now)
-- userid (may be null)
WITH searchresults AS (
  SELECT id
  FROM search_index_${language:raw}
  WHERE document @@ to_tsquery('english', ${query}) ${filter:raw}
)

SELECT
  id,
  type,
  featured,
  location_name,
  address1,
  address2,
  city,
  province,
  postal_code,
  country,
  latitude,
  longitude,
  EXISTS (SELECT 1 FROM searchresults WHERE things.id = searchresults.id) searchmatched,
  texts.title,
  texts.description,
  substring(texts.body for 500) AS body,
  to_json(COALESCE(photos, '{}')) AS photos,
  to_json(COALESCE(videos, '{}')) AS videos,
  updated_date,
  post_date
FROM
  things,
  get_localized_texts(things.id, ${language}) AS texts
ORDER BY searchmatched DESC, featured DESC, updated_date DESC
;
