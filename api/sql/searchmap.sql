-- Parameters
-- query
-- language (defaults to 'en'
-- offset (defaults to 1)
-- limit (20 for now)
-- userid (may be null)
SELECT
  things.id,
  things.type,
  things.featured,
  title,
  to_json(COALESCE(things.location, '("","","","","","","","","")'::geolocation)) AS location,
  to_json(COALESCE(things.images, '{}')) AS images,
  to_json(COALESCE(things.videos, '{}')) AS videos
FROM search_index_${language:raw}, things
WHERE document @@ to_tsquery('english', ${query}) ${filter:raw} AND
      search_index_${language:raw}.id = things.id
ORDER BY ts_rank(search_index_${language:raw}.document, to_tsquery('english', ${query})) DESC
;
