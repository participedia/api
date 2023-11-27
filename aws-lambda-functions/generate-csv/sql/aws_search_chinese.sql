-- Parameters
-- query
-- language (defaults to 'en'
-- offset (defaults to 1)
-- limit (20 for now)
-- userid (may be null)

SELECT 
 id,
 type,
 published,
 featured,
 verified,
 location_name,
 address1,
 address2,
 city,
 province,
 postal_code,
 country,
 latitude,
 longitude,
 texts.title,
 texts.description,
 texts.body,
  -- to_json(get_location(${type:name}.id)) AS location,
  to_json(COALESCE(photos, '{}')) AS photos,
  to_json(COALESCE(videos, '{}')) AS videos,
  updated_date,
  post_date
  
FROM
  things,
  get_localized_texts_fallback(id, ${language}, original_language) AS texts
WHERE
  POSITION(${query} in texts.title) > 0 OR
  POSITION(${query} in texts.description) > 0 OR
  POSITION(${query} in texts.body) > 0

  LIMIT ${limit}
;
