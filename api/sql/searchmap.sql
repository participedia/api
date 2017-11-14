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
  EXISTS (SELECT 1 FROM searchresults WHERE things.id = searchresults.id) searchmatched,
  title,
  to_json(COALESCE(location, '("","","","","","","","","")'::geolocation)) AS location,
  to_json(COALESCE(images, '{}')) AS images,
  to_json(COALESCE(videos, '{}')) AS videos
FROM things, localized_texts
WHERE
  things.id = localized_texts.thingid AND
  localized_texts.language = 'en'
ORDER BY searchmatched DESC, featured DESC, updated_date DESC
;
